import _ from 'underscore'
import { combineReducers } from 'redux'
import { createStore } from 'redux'

import Actions from './actions'

const initialState = {
  isLoading: false,
  is_admin: false,
  project: {},
  selections: [],
  options: [],
  selections_by_category: {},
  options_by_id: {},
  modals: {
    editOptionId: null,
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_PROJECT:
      return updateProject(state, action);
      break;

    case Actions.ADD_SELECTION:
      break;
    case Actions.REMOVE_SELECTION:
      break;

    case Actions.UNLINK_OPTION:
      return unlinkOptionFromSelection(state, action)
      break;

    case Actions.LOADING:
      return _.extend({}, state, { isLoading: action.isLoading })
      break;

    case Actions.OPEN_EDIT_OPTIONS_MODAL:
      break;
  }

  return state
}

function unlinkOptionFromSelection(state, action) {
  selection = _.extend({}, state.selections.find((s) => (s.id == action.selectionId)))
  selection.fields["Options"] = _.without(selection.fields["Options"] || [], action.optionId)
}

function updateProject(state, action) {
  var project = action.project;
  var selections = action.selections;
  var options = action.options;

  var newState = _.extend({}, state, _.pick(action, "project", "selections", "options", "is_admin"))
  newState.selections_by_category = _.groupBy(newState.selections, (s) => (s.fields["Category"]));
  newState.options_by_id = _.indexBy(newState.options, (s) => (s["id"]));

  return newState;
}

const finishesStore = createStore(reducer);

export default finishesStore
