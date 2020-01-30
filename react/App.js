import React from 'react';
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import FinishSelectionFilters from './FinishSelectionFilters';
import FinishSelectionModal from './FinishSelectionModal';
import FinishSelectionCategoryTable from './FinishSelectionCategoryTable';
import FinishCategoriesModal from './FinishCategoriesModal';
import FinishAdminSection from './FinishAdminSection';

import './App.css';
import './FinishSelectionTable.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this._isDragging = false;

    // Keep selection state in here
    this.state = {
      isLoading: false,
      categoriesModal: null,
      selectionModal: null,
      optionModal: null,
      currentFilter: "All",
      selectionsByCategory: {},
      filteredSelectionsByCategory: {},
      orderedCategories: [],
      adminMode: false,
    }
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    ActionCreators.load((data) => {
      // Combine selections and options
      const selections = data.selections_by_category;
      const options = data.options_by_selection_id;

      Object.keys(selections).forEach(category => {
        selections[category].forEach(s => s["Options"] = options[s["id"]]);
      });

      this.setState({
        isLoading: false,
        selectionsByCategory: selections,
        filteredSelectionsByCategory: _.clone(selections),
        orderedCategories: Object.keys(selections),
        adminMode: data["admin_mode"]
      });
    })
  }

  _getFilteredSelectionsByCategory(selectionsByCategory, currentFilter) {
    let filteredSelectionsByCategory = {};

    Object.keys(selectionsByCategory || {}).forEach((key, i) => {
      let filtered = Array.from(selectionsByCategory[key] || []);

      if (currentFilter != "All") {
        filtered = filtered.filter((s) => s["fields"]["Location"] == currentFilter);
      }

      filteredSelectionsByCategory[key] = filtered;
    });

    return filteredSelectionsByCategory;
  }

  onChangeFilter = (filter) => {
    const { selectionsByCategory } = this.state;
    const filteredSelectionsByCategory = this._getFilteredSelectionsByCategory(selectionsByCategory, filter );
    this.setState({ filteredSelectionsByCategory, currentFilter: filter });
  }

  onDragStartSelection = () => {
    this._isDragging = true;
  }

  handleOpenCategoryModalFor = (category) => {
    return _ => this.setState({ categoriesModal: category });
  }

  onDragEndSelection = (result) => {
    const { selectionsByCategory, filteredSelectionsByCategory } = this.state;
    const { source, destination } = result;
    if (!destination) return;
    // Picked it up and dropped it in the same spot.
    if (source.droppableId == destination.droppableId && source.index == destination.index) return;

    if (result["type"] == "SELECTION") {
      const sourceSelectionId = filteredSelectionsByCategory[source.droppableId][source.index]["id"];
      const sourceSelections = Array.from(selectionsByCategory[source.droppableId]);
      const sourceSelectionIndex = sourceSelections.findIndex(s => s["id"] == sourceSelectionId);

      let destSelections = sourceSelections;
      let destSelectionId = null;
      let destSelectionIndex = null;

      if (source.droppableId != destination.droppableId) {
        destSelections = Array.from(selectionsByCategory[destination.droppableId]);
      }

      if (destination.index < filteredSelectionsByCategory[destination.droppableId].length) {
        destSelectionId = filteredSelectionsByCategory[destination.droppableId][destination.index]["id"];
        destSelectionIndex = destSelections.findIndex(s => s["id"] == destSelectionId);
      } else {
        destSelectionId = filteredSelectionsByCategory[destination.droppableId][destination.index - 1]["id"];
        // Put after the selection we moved it after.
        destSelectionIndex = destSelections.findIndex(s => s["id"] == destSelectionId) + 1;
      }

      // Remove after finding indexes
      const [removed] = sourceSelections.splice(sourceSelectionIndex, 1);

      selectionsByCategory[source.droppableId] = sourceSelections;
      destSelections.splice(destSelectionIndex, 0, removed);
      selectionsByCategory[destination.droppableId] = destSelections;
    } else if (result["type"] == "OPTION") {
      const [sourceCategory, sourceDroppableId] = source.droppableId.split("/");
      const [destCategory, destDroppableId] = destination.droppableId.split("/");
      const sourceSelections = Array.from(selectionsByCategory[sourceCategory]);

      const sourceSelectionIndex = sourceSelections.findIndex(s => s["id"] == sourceDroppableId);
      const sourceSelection = _.clone(sourceSelections[sourceSelectionIndex]);
      const sourceOptions = Array.from(sourceSelection["Options"]);
      let destSelections = sourceSelections;
      let destSelectionIndex = sourceSelectionIndex;
      let destSelection = sourceSelection;
      let destOptions = sourceOptions;

      if (sourceCategory != destCategory) {
        destSelections = Array.from(selectionsByCategory[destCategory]);
      }

      if (sourceDroppableId != destDroppableId) {
        destSelectionIndex = destSelections.findIndex(s => s["id"] == destDroppableId);
        destSelection = _.clone(destSelections[destSelectionIndex]);
        destOptions = Array.from(destSelection["Options"]);
      }

      const [removedOption] = sourceOptions.splice(source.index, 1);

      sourceSelection["Options"] = sourceOptions;
      sourceSelections[sourceSelectionIndex] = sourceSelection;
      selectionsByCategory[sourceCategory] = sourceSelections;

      destOptions.splice(destination.index, 0, removedOption);
      destSelection["Options"] = destOptions;
      destSelections[destSelectionIndex] = destSelection;
      selectionsByCategory[destCategory] = destSelections;
    }

    const { currentFilter } = this.state;
    const newFilteredSelectionsByCategory = this._getFilteredSelectionsByCategory(selectionsByCategory, currentFilter);

    this.setState({ selectionsByCategory, filteredSelectionsByCategory: newFilteredSelectionsByCategory });
    this._isDragging = false;
  }

  onSaveCategories = (categories) => {
    const { currentFilter } = this.state;
    const selectionsByCategory = _.clone(this.state.selectionsByCategory || {});

    const orderedCategories = (categories || []).map(c => {
      if (c.original != c.category) {
        selectionsByCategory[c.category] = selectionsByCategory[c.original] || [];
        delete selectionsByCategory[c.original]
      }

      return c.category;
    });

    this.setState({
      orderedCategories,
      selectionsByCategory,
      selectionModal: null,
      optionModal: null,
      categoriesModal: null,
      filteredSelectionsByCategory: this._getFilteredSelectionsByCategory(selectionsByCategory, currentFilter)
    });
  }

  onSaveSelection = (originalCategory, selection) => {
    const { selectionsByCategory, currentFilter } = this.state;
    const sourceSelectionsForCat = Array.from(selectionsByCategory[originalCategory]);
    const selectionId = selection["id"];
    if (!sourceSelectionsForCat) return;

    const selectionIndex = sourceSelectionsForCat.findIndex(s => s["id"] == selectionId);
    const destCategory = (selection["fields"] || {})["Category"];
    let destSelectionsForCat = selectionsByCategory[destCategory];

    if (originalCategory == destCategory) {
      if (selectionIndex == -1) {
        // If source selection not found, add to end of dest selections.
        // Not typical path. Shouldn't happen really.
        destSelectionsForCat.push(selection);
      } else {
        destSelectionsForCat[selectionIndex] = selection;
      }
    } else {
      if (selectionIndex != -1) {
        // Remove selection from source if found index
        sourceSelectionsForCat.splice(selectionIndex, 1);
      }

      // Append selection to end of destination.
      destSelectionsForCat = Array.from(selectionsByCategory[destCategory]);
      destSelectionsForCat.push(selection);
    }

    selectionsByCategory[originalCategory] = sourceSelectionsForCat;
    selectionsByCategory[destCategory] = destSelectionsForCat;

    this.setState({
      selectionsByCategory,
      selectionModal: null,
      optionModal: null,
      filteredSelectionsByCategory: this._getFilteredSelectionsByCategory(selectionsByCategory, currentFilter)
    });
  }

  onClickSelection = (selection) => {
    if (this._isDragging) return;
    this.setState({ selectionModal: selection, optionModal: null });
  }

  onClickOption = (option, selection) => {
    if (this._isDragging) return;
    this.setState({ selectionModal: selection, optionModal: option });
  }

  getFilters() {
    const { selectionsByCategory } = this.state;
    const allSelections = Object.values(selectionsByCategory).flat();
    const locations = {};

    allSelections.forEach((selection) => {
      const l = selection["fields"]["Location"];
      if (l && !locations[l]) locations[l] = true;
    });

    return Object.keys(locations);
  }

  renderCategorySections() {
    const { orderedCategories, currentFilter, filteredSelectionsByCategory } = this.state;

    return orderedCategories.map((key, i) => {
      return (
        <FinishSelectionCategoryTable
          key={key}
          name={key}
          selections={filteredSelectionsByCategory[key] || []}
          onClickSelection={this.onClickSelection}
          onClickOption={this.onClickOption}
          onClickEditCategory={this.handleOpenCategoryModalFor(key)}
        />
      )
    });
  }

  renderCategoriesModal() {
    const { orderedCategories, categoriesModal, selectionsByCategory } = this.state;
    if (!categoriesModal) return "";

    return (
      <FinishCategoriesModal
        key={categoriesModal}
        categories={orderedCategories}
        selectedCategory={categoriesModal}
        onClose={_ => this.setState({ categoriesModal: null }) }
        onSave={this.onSaveCategories}
      />
    );
  }

  renderSelectionModal() {
    const { selectionModal, optionModal, selectionsByCategory } = this.state;
    if (!selectionModal) return "";
    const categories = Object.keys(selectionsByCategory);

    return (
      <FinishSelectionModal
        key={selectionModal["id"]}
        selection={selectionModal}
        selectedOption={optionModal}
        categories={categories}
        onClose={_ => this.setState({ selectionModal: null, optionModal: null }) }
        onSave={this.onSaveSelection}
      />
    );
  }

  renderLoading() {
    const { isLoading } = this.state;
    if (!isLoading) return "";

    return (
      <div className="ui inverted dimmer active">
        <div className="ui grey header content">Loading...</div>
      </div>
    );
  }

  render() {
    const { currentFilter, adminMode } = this.state;
    const wrapperClasses = ["xlarge-container", adminMode ? "admin-mode" : ""];

    return (
      <AdminContext.Provider value={adminMode}>
        {adminMode && <FinishAdminSection
          onClickManageCategories={this.handleOpenCategoryModalFor(true)}
        />}
        <div className={wrapperClasses.join(" ")}>
          <FinishSelectionFilters
            current={currentFilter}
            filters={this.getFilters()}
            onChange={this.onChangeFilter}
            />
          <DragDropContext onDragEnd={this.onDragEndSelection} onDragStart={this.onDragStartSelection} >
            {this.renderCategorySections()}
          </DragDropContext>
          <div className="modal-container">
            {adminMode && this.renderCategoriesModal()}
            {adminMode && this.renderSelectionModal()}
            {this.renderLoading()}
          </div>
        </div>
      </AdminContext.Provider>
    );
  }
}

export default App;
