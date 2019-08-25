import React from 'react';
import { connect } from 'react-redux'

import ActionCreators from './action_creators';

import SelectionCategorySection from './SelectionCategorySection';

import './App.css';

class App extends React.Component {
  componentDidMount() {
    ActionCreators.load()
  }

  render() {
    const { selections_by_category } = this.props;

    return (
      <div className="selections-container">
        {Object.keys(selections_by_category).map((value, index) => {
          return <SelectionCategorySection
                    category={value}
                    selections={selections_by_category[value]}
                    />
        })}
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    selections_by_category: state.selections_by_category
  }),
  (dispatch) => ({
  })
)(App);
