import React from 'react';
import * as _ from 'underscore';
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
        adminMode: data["admin_mode"]
      });
    })
  }

  onChangeFilter = (filter) => {
    this.setState({ currentFilter: filter });
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
      const selections = Array.from(selectionsByCategory[source.droppableId]);
      const [removed] = selections.splice(source.index, 1);
      selections.splice(destination.index, 0, removed);

      selectionsByCategory[source.droppableId] = selections;

      this.setState({ selectionsByCategory });
    } else if (result["type"] == "OPTION") {
      const [sourceCategory, sourceDroppableId] = source.droppableId.split("/");
      const [destCategory, destDroppableId] = destination.droppableId.split("/");
      // sourceCategory == destCategory always for meow
      const selections = Array.from(selectionsByCategory[sourceCategory]);

      const sourceSelection = selections.find(s => s["id"] == sourceDroppableId);
      const sourceOptions = Array.from(sourceSelection["Options"]);
      const [removedOption] = sourceOptions.splice(source.index, 1);

      if (sourceDroppableId != destDroppableId) {
        // Moving to another selection.
        const destSelection = selections.find(s => s["id"] == destDroppableId);
        const destOptions = Array.from(destSelection["Options"]);

        destOptions.splice(destination.index, 0, removedOption);
        destSelection["Options"] = destOptions;
      } else {
        sourceOptions.splice(destination.index, 0, removedOption);
      }

      sourceSelection["Options"] = sourceOptions;

      selectionsByCategory[sourceCategory] = selections;
      this.setState({ selectionsByCategory });
    }

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
    const { currentFilter, selectionsByCategory } = this.state;

    return Object.keys(selectionsByCategory || {}).map((key, i) => {
      let filtered = selectionsByCategory[key] || [];

      if (currentFilter != "All") {
        filtered = filtered.filter((s) => s["fields"]["Location"] == currentFilter);
      }

      return (
        <FinishSelectionCategoryTable
          key={key}
          name={key}
          selections={filtered}
          onDragStartSelection={this.onDragStartSelection}
          onDragEndSelection={this.onDragEndSelection}
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
          {this.renderCategorySections()}
          {adminMode && this.renderSelectionModal()}
          {this.renderLoading()}
        </div>
      </AdminContext.Provider>
    );
  }
}

export default App;
