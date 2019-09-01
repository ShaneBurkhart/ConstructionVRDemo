import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import SelectionCategorySection from './SelectionCategorySection';
import EditOptionModal from './EditOptionModal';

import './App.css';

class App extends React.Component {
  componentDidMount() {
    this.props.loadProject()
  }

  render() {
    const { selections_by_category, isLoading, editOption } = this.props;
    console.log("render");

    const dimmerClass = ["ui page inverted dimmer", isLoading ? "active" : ""].join(" ")

    return (
      <div className="app-container">
        <div className="selections-container">
          {Object.keys(selections_by_category).map((value, index) => {
            return <SelectionCategorySection
                      key={value}
                      category={value}
                      selections={selections_by_category[value]}
                      />
          })}
        </div>
        {!!editOption && <EditOptionModal option={editOption} />}
        <div className={dimmerClass}>
          <div className="ui grey header content">Loading...</div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    isLoading: state.isLoading,
    editOption: state.options_by_id[state.modals.editOptionId],
    selections_by_category: state.selections_by_category
  }),
  (dispatch, props) => (bindActionCreators({
    loadProject: () => (ActionCreators.load()),
  }, dispatch))
)(App);
