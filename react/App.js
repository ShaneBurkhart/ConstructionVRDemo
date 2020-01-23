import React from 'react';

import ActionCreators from './action_creators';

import FinishSelectionFilters from './FinishSelectionFilters';
import FinishSelectionCategoryTable from './FinishSelectionCategoryTable';

import './App.css';
import './FinishSelectionTable.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.onDragStartSelection = this.onDragStartSelection.bind(this);
    this.onDragEndSelection = this.onDragEndSelection.bind(this);
    this.onClickSelection = this.onClickSelection.bind(this);

    // Keep selection state in here
    this.state = {
      isLoading: false,
      selectionModal: null,
      currentFilter: "All",
      selectionsByCategory: {},
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

      this.setState({ isLoading: false, selectionsByCategory: selections });
    })
  }

  onChangeFilter(filter) {
    this.setState({ currentFilter: filter });
  }

  onDragStartSelection() {
  }

  onDragEndSelection(result) {
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
    }
  }

  onClickSelection(selectionId) {
    console.log(selectionId);
    this.setState({ selectionModal: selectionId });
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
          />
      )
    });
  }

  renderSelectionModal() {
    const { selectionModal } = this.state;
    if (!selectionModal) return "";

    return (
      <div className="ui inverted dimmer active">
        <div className="ui grey header content">Loading...</div>
      </div>
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
    const { currentFilter } = this.state;

    return (
      <div className="xlarge-container">
        <FinishSelectionFilters
          current={currentFilter}
          filters={this.getFilters()}
          onChange={this.onChangeFilter}
          />
        {this.renderCategorySections()}
        {this.renderSelectionModal()}
        {this.renderLoading()}
      </div>
    );
  }
}

export default App;
