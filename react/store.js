import _ from 'underscore'
import { combineReducers } from 'redux'
import { createStore } from 'redux'

import Actions from './actions'

const initialState = {
  isLoading: false,
  selections_by_category: {},
  options_by_selection_id: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_PROJECT:
      return updateProject(state, action);
      break;
    case Actions.LOADING:
      return _.extend({}, state, { isLoading: action.isLoading })
      break;
  }

  return state
}

function updateProject(state, action) {
  var selections = action.selections_by_category;
  var options = action.options_by_selection_id;

  var newState = _.extend({}, state, {
    selections_by_category: action.selections_by_category,
    options_by_selection_id: action.options_by_selection_id,
  });

  return newState;
}

const finishesStore = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default finishesStore
