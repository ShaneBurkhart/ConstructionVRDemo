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
import FinishSelectionLinkOptionModal from './FinishSelectionLinkOptionModal';
import FinishAdminSection from './FinishAdminSection';

import './App.css';
import './FinishSelectionTable.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this._isDragging = false;

    this._superSetState = this.setState;
    this.setState = (newState) => {
      this._superSetState(newState);

      if (newState.categories && newState.isLoading === undefined) {
        const categories = newState.categories;
        // Save categories
        ActionCreators.save(categories);
      }
    }

    // Keep selection state in here
    this.state = {
      isLoading: false,
      categoriesModal: null,
      selectionModal: null,
      optionModal: null,
      linkOptionToSelectionModal: null,
      currentFilter: "All",
      categories: [],
      selectionsByCategory: {},
      filteredSelectionsByCategory: {},
      adminMode: false,
    }
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    ActionCreators.load((data) => {
      // Combine selections and options
      const categories = Array.from(data.categories);
      const selections = Array.from(data.selections);
      const options = Array.from(data.options);
      const { currentFilter } = this.state;

      selections.forEach(s => {
        s["Options"] = _.filter(options, o => (s.fields["Options"] || "").includes(o.id));
      });
      categories.forEach(c => {
        c["Selections"] = _.filter(selections, s => (s.fields["Category"] || [])[0] == c.id)
          .sort((a, b) => ((a["fields"]["Order"] || 0) - (b["fields"]["Order"] || 0)));
      });

      const categoriesState = this._getCategoriesState(categories, currentFilter);

      this.setState({
        isLoading: false,
        adminMode: data["admin_mode"],
        ...categoriesState
      });
    })
  }

  _getCategoriesState(categories, currentFilter) {
    const selectionsByCategory = {};

    categories.forEach(c => {
      selectionsByCategory[c.id] = c["Selections"];
    });

    const filteredSelectionsByCategory = this._getFilteredSelectionsByCategory(selectionsByCategory, currentFilter);

    return {
      categories: categories,
      selectionsByCategory: selectionsByCategory,
      filteredSelectionsByCategory: filteredSelectionsByCategory,
    };
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

    const { categories, currentFilter } = this.state;

    // Set updated selections to categories in state and reset
    const newCategories = Object.keys(selectionsByCategory).map(categoryID => {
      const selections = selectionsByCategory[categoryID];
      const category = _.clone(categories.find(c => c.id == categoryID));
      category["Selections"] = selections;
      return category;
    });

    this.setState(this._getCategoriesState(newCategories, currentFilter));
    this._isDragging = false;
  }

  onSaveCategories = (categories) => {
    const { currentFilter } = this.state;
    const categoriesState = this._getCategoriesState(categories, currentFilter);

    this.setState({
      selectionModal: null,
      optionModal: null,
      categoriesModal: null,
      ...categoriesState
    });
  }

  onSaveSelection = (originalCategoryId, selection) => {
    const { selectionsByCategory, currentFilter } = this.state;
    const sourceSelectionsForCat = Array.from(selectionsByCategory[originalCategoryId]);
    const selectionId = selection["id"];
    if (!sourceSelectionsForCat) return;

    const selectionIndex = sourceSelectionsForCat.findIndex(s => s["id"] == selectionId);
    const destCategory = (selection["fields"] || {})["Category"][0];
    let destSelectionsForCat = selectionsByCategory[destCategory];

    if (originalCategoryId == destCategory) {
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

    selectionsByCategory[originalCategoryId] = sourceSelectionsForCat;
    selectionsByCategory[destCategory] = destSelectionsForCat;

    const { categories } = this.state;

    // Set updated selections to categories in state and reset
    const newCategories = Object.keys(selectionsByCategory).map(categoryID => {
      const selections = selectionsByCategory[categoryID];
      const category = _.clone(categories.find(c => c.id == categoryID));
      category["Selections"] = selections;
      return category;
    });

    this.setState({
      linkOptionToSelectionModal: null,
      selectionModal: null,
      optionModal: null,
      ...this._getCategoriesState(newCategories, currentFilter)
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

  onClickLinkOption = (selection) => {
    if (this._isDragging) return;
    this.setState({ linkOptionToSelectionModal: selection });
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
    const { categories, currentFilter, filteredSelectionsByCategory } = this.state;

    return categories.map((category, i) => {
      const key = category.id;
      const name = category.fields["Name"];

      return (
        <FinishSelectionCategoryTable
          key={category.id}
          category={category}
          selections={filteredSelectionsByCategory[key] || []}
          onClickSelection={this.onClickSelection}
          onClickOption={this.onClickOption}
          onClickLinkOption={this.onClickLinkOption}
          onClickEditCategory={this.handleOpenCategoryModalFor(key)}
        />
      )
    });
  }

  renderCategoriesModal() {
    const { categories, categoriesModal} = this.state;
    if (!categoriesModal) return "";

    return (
      <FinishCategoriesModal
        key={categoriesModal}
        categories={categories}
        selectedCategory={categoriesModal}
        onClose={_ => this.setState({ categoriesModal: null }) }
        onSave={this.onSaveCategories}
      />
    );
  }

  renderSelectionModal() {
    const { selectionModal, optionModal, categories } = this.state;
    if (!selectionModal) return "";

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

  renderLinkOptionToSelectionModal() {
    const { linkOptionToSelectionModal } = this.state;
    if (!linkOptionToSelectionModal) return "";

    return (
      <FinishSelectionLinkOptionModal
        key={linkOptionToSelectionModal["id"]}
        selection={linkOptionToSelectionModal}
        onClose={_ => this.setState({ linkOptionToSelectionModal: null }) }
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
            {adminMode && this.renderLinkOptionToSelectionModal()}
            {this.renderLoading()}
          </div>
        </div>
      </AdminContext.Provider>
    );
  }
}

export default App;
