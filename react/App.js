import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import './App.css';

class App extends React.Component {
  componentDidMount() {
    this.props.load()
  }

  render() {
    const { selections_by_category, isLoading, editOption, selectingForSelection } = this.props;
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
        {!!editOption && !selectingForSelection &&
          <EditOptionModal option={editOption} />
        }
        {!!selectingForSelection &&
          <SelectionModal selection={selectingForSelection} />
        }
        {isLoading &&
          <div className="ui page inverted dimmer active">
            <div className="ui grey header content">Loading...</div>
          </div>
        }
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    isLoading: state.isLoading,
    editOption: state.options_by_id[state.modals.editOptionId],
    selectingForSelection: state.selections_by_id[state.modals.selectingForSelectionId],
    selections_by_category: state.selections_by_category
  }),
  (dispatch, props) => (bindActionCreators({
    load: () => (ActionCreators.load()),
  }, dispatch))
)(App);
