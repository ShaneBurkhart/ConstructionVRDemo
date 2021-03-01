import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import Actions from '../../common/actions';

const _initialState = {

};

const computeState = (newState) => {
  return newState;
};

const todos = (state = {}, action) => {
  console.log(action);

  switch (action.type) {
    // case Actions.FUTURE_ACTION:
    //   return addFutureAction(state, action);
    default:
      return state
  }
};

export default createStore(
  todos,
  _initialState,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  ),
);
