import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import FinishSelectionFilters from './FinishSelectionFilters';
import FinishSelectionCategoryTable from './FinishSelectionCategoryTable';

import './App.css';
import './FinishSelectionTable.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.onChangeFilter = this.onChangeFilter.bind(this);

    this.state = {
      currentFilter: "All",
    }
  }

  componentDidMount() {
    this.props.load()
  }

  onChangeFilter(filter) {
    this.setState({ currentFilter: filter });
  }

  getFilters() {
    const { selections_by_category } = this.props;
    const allSelections = Object.values(selections_by_category).flat();
    const locations = {};

    allSelections.forEach((selection) => {
      const l = selection["fields"]["Location"];
      if (l && !locations[l]) locations[l] = true;
    });

    return Object.keys(locations);
  }

  renderCategorySections() {
    const { selections_by_category } = this.props;
    const { currentFilter } = this.state;

    return Object.keys(selections_by_category || {}).map((key, i) => {
      let filtered = selections_by_category[key] || [];

      if (currentFilter != "All") {
        filtered = filtered.filter((s) => s["fields"]["Location"] == currentFilter);
      }

      return (
        <FinishSelectionCategoryTable
          key={key}
          name={key}
          selections={filtered}
          />
      )
    });
  }

  renderLoading() {
    const { isLoading } = this.props;
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
        {this.renderLoading()}
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    isLoading: state.isLoading,
    selections_by_category: state.selections_by_category,
    options_by_selection_id: state.options_by_selection_id
  }),
  (dispatch, props) => (bindActionCreators({
    load: () => (ActionCreators.load()),
  }, dispatch))
)(App);
