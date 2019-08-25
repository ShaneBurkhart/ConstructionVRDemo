import { combineReducers } from 'redux'
import { createStore } from 'redux'

import Actions from './actions'

const initialState = {
  selection: [],
  options: [],
  selections_by_category: {},
};

const reducer = (state = initialState, action) => {
  if (typeof state === 'undefined') {
    return initialState
  }

  switch (action.type) {
    case Actions.ADD_SELECTION:
      break;
    case Actions.REMOVE_SELECTION:
      break;
  }

  return state
}

const finishesStore = createStore(reducer);

export default finishesStore
