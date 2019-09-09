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
  searchResults: {
    query: "",
    userLibrary: [],
    finishVisionLibrary: [],
  },
  promoResults: {
    byOptionType: {},
  },
  selections_by_category: {},
  selections_by_id: {},
  options_by_id: {},
  modals: {
    editOptionId: null,
    selectingForSelectionId: null,
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_PROJECT:
      return updateProject(state, action);
      break;

    case Actions.UPDATE_SEARCH_RESULTS:
      return updateSearchResults(state, action);
      break;
    case Actions.CLEAR_SEARCH_RESULTS:
      return _.extend({}, state, { searchResults: {
        query: "", userLibrary: [], finishVisionLibrary: []
      }});
      break;

    case Actions.ADD_SELECTION:
      break;
    case Actions.REMOVE_SELECTION:
      break;

    case Actions.UNLINK_OPTION:
      return unlinkOptionFromSelection(state, action)
      break;

    case Actions.OPEN_MODAL:
      var newModals = _.extend({}, state.modals, { [action.modal]: action.id })
      return _.extend({}, state, { modals: newModals });
      break;
    case Actions.CLOSE_MODAL:
      var newModals = _.extend({}, state.modals, { [action.modal]: null })
      return _.extend({}, state, { modals: newModals });
      break;
    case Actions.LOADING:
      return _.extend({}, state, { isLoading: action.isLoading })
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
  newState.selections_by_id = _.indexBy(newState.selections, (s) => (s["id"]));

  return newState;
}

function updateSearchResults(state, action) {
  if ("promoResults" in action) {
    return _.extend({}, state, _.pick(action, "promoResults"))
  } else {
    return _.extend({}, state, _.pick(action, "searchResults"))
  }
}

const finishesStore = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default finishesStore
