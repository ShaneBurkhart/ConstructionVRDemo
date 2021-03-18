import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const _initialState = {
  adminMode: false,
  finishes: [],
  modals: {},
};


const todos = (state = {}, action) => {
  switch (action.type) {
    case "LOAD":
      const { adminMode, finishes } = action.data;
      return { ...state, adminMode, finishes };
    
      case "NEW_FINISH":
      return { ...state, finishes: [...state.finishes, action.data]}


    case 'API_ERROR':
      return { ...state, apiError: {
        status: action.data ? action.data.status : 404,
        // message: action.data.responseJSON.msg
        message: "API ERROR"
      }}
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
