import React from 'react';
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import FinishSelectionFilters from './FinishSelectionFilters';
import FinishSelectionModal from './FinishSelectionModal';
import FinishSelectionCategoryTable from './FinishSelectionCategoryTable';

import './App.css';
import './FinishSelectionTable.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this._isDragging = false;

    // Keep selection state in here
    this.state = {
      isLoading: false,
      selectionModal: null,
      optionModal: null,
      currentFilter: "All",
      selectionsByCategory: {},
      filteredSelectionsByCategory: {},
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
    const { selectionsByCategory, currentFilter } = this.state;
    const filteredSelectionsByCategory = this._getFilteredSelectionsByCategory(selectionsByCategory, currentFilter);
    this.setState({ filteredSelectionsByCategory, currentFilter: filter });
  }

  onDragStartSelection = () => {
    this._isDragging = true;
  }

  onDragEndSelection = (result) => {
    const { selectionsByCategory } = this.state;
    const { source, destination } = result;
    if (!destination) return;

    console.log(result);
    console.log(source);
    console.log(destination);

    if (result["type"] == "SELECTION") {
      const sourceSelections = Array.from(selectionsByCategory[source.droppableId]);
      const [removed] = sourceSelections.splice(source.index, 1);

      selectionsByCategory[source.droppableId] = sourceSelections;

      const destSelections = Array.from(selectionsByCategory[destination.droppableId]);

      destSelections.splice(destination.index, 0, removed);
      selectionsByCategory[destination.droppableId] = destSelections;
    } else if (result["type"] == "OPTION") {
      const [sourceCategory, sourceDroppableId] = source.droppableId.split("/");
      const [destCategory, destDroppableId] = destination.droppableId.split("/");
      const sourceSelections = Array.from(selectionsByCategory[sourceCategory]);

      const sourceSelectionIndex = sourceSelections.findIndex(s => s["id"] == sourceDroppableId);
      const sourceSelection = _.clone(sourceSelections[sourceSelectionIndex]);
      const sourceOptions = Array.from(sourceSelection["Options"]);
      const [removedOption] = sourceOptions.splice(source.index, 1);

      sourceSelection["Options"] = sourceOptions;
      sourceSelections[sourceSelectionIndex] = sourceSelection;
      selectionsByCategory[sourceCategory] = sourceSelections;

      const destSelections = Array.from(selectionsByCategory[destCategory]);
      const destSelectionIndex = destSelections.findIndex(s => s["id"] == destDroppableId);
      const destSelection = _.clone(destSelections[destSelectionIndex]);
      const destOptions = Array.from(destSelection["Options"]);

      destOptions.splice(destination.index, 0, removedOption);
      destSelection["Options"] = destOptions;
      destSelections[destSelectionIndex] = destSelection;
      selectionsByCategory[destCategory] = destSelections;
    }

    const { currentFilter } = this.state;
    const filteredSelectionsByCategory = this._getFilteredSelectionsByCategory(selectionsByCategory, currentFilter);

    this.setState({ selectionsByCategory, filteredSelectionsByCategory });
    this._isDragging = false;
  }

  onSaveSelection = (selectionId, selectionFields, selectionOptions) => {
    const { selectionsByCategory } = this.state;

    Object.keys(selectionsByCategory).forEach((cat) => {
      const selectionsForCat = selectionsByCategory[cat];
      const selection = selectionsForCat.find(s => s["id"] == selectionId);
      if (!selection) return;

      selectionsByCategory[cat] = Array.from(selectionsForCat).map(s => {
        if (s["id"] != selectionId) return s;
        s["fields"] = _.extend(s["fields"], selectionFields);
        s["Options"] = _.extend(s["Options"], selectionOptions);
        return s;
      });
    });

    this.setState({ selectionModal: null, optionModal: null, selectionsByCategory });
  }

  onClickSelection = (selectionId) => {
    if (this._isDragging) return;
    console.log(selectionId);
    this.setState({ selectionModal: selectionId, optionModal: null });
  }

  onClickOption = (optionId, selectionId) => {
    if (this._isDragging) return;
    console.log(optionId);
    console.log(selectionId);
    this.setState({ selectionModal: selectionId, optionModal: optionId });
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
    const { currentFilter, filteredSelectionsByCategory } = this.state;

    return Object.keys(filteredSelectionsByCategory || {}).map((key, i) => {
      return (
        <FinishSelectionCategoryTable
          key={key}
          name={key}
          selections={filteredSelectionsByCategory[key]}
          onClickSelection={this.onClickSelection}
          onClickOption={this.onClickOption}
        />
      )
    });
  }

  renderSelectionModal() {
    const { selectionModal, optionModal, selectionsByCategory } = this.state;
    if (!selectionModal) return "";

    const selections = Object.values(selectionsByCategory)
      .reduce((acc, val) => acc.concat(val), []);
    const selection = selections.find(s => s["id"] == selectionModal);
    if (!selection) return "";

    return (
      <FinishSelectionModal
        key={selectionModal}
        selection={selection}
        selectedOptionId={optionModal}
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
        <div className={wrapperClasses.join(" ")}>
          <FinishSelectionFilters
            current={currentFilter}
            filters={this.getFilters()}
            onChange={this.onChangeFilter}
            />
          <DragDropContext onDragEnd={this.onDragEndSelection} onDragStart={this.onDragStartSelection} >
            {this.renderCategorySections()}
          </DragDropContext>
          {adminMode && this.renderSelectionModal()}
          {this.renderLoading()}
        </div>
      </AdminContext.Provider>
    );
  }
}

export default App;
