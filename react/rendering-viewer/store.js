import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk';
import ActionCreators from './action_creators';
import Actions from '../../common/actions'

const _initialState = {
  isAdmin: false,
  modals: {},
};

const indexByID = (arr) => {
  return arr.reduce((memo,b) => ({...memo, [b["id"]]: b }), {});
}

const load = (state, action) => {
  return { ...state, ...(action.data || {}) };
};

const todos = (state = {}, action) => {
  console.log(action);

  switch (action.type) {
    case Actions.LOAD:
      return load(state, action);
    case Actions.UPDATE_UNIT:
      return { ...state, unit: { ...state.unit, ...action.unit }};
    case Actions.UPDATE_MODAL:
      return { ...state, modals: { ...state.modals, ...action.modals }};
    default:
      return state
  }
}

export default createStore(
  todos,
  _initialState,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  ),
);
