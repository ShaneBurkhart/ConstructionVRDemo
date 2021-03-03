import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const _initialState = {
  users: [],
  usersMeta: null,
  apiError: null,
};

const todos = (state = {}, action) => {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.data };

    case "INVITE_USER":
      return { ...state, users: [...state.users, action.data] };

    case "UPDATE_USER":
      return {
        ...state,
        users: (state.users || []).map(u => u.id === action.data.id ? action.data : u)
      };

    case "DELETE_USER":
      return { ...state, users: [...state.users.filter(u=>action.data.id.localeCompare(u.id) !== 0)] };

    case 'API_ERROR':
      return { ...state, apiError: {
        status: action.data.status,
        // message: action.data.responseJSON.msg
        message: "API ERROR"
      }}
    default:
      return state
  }
}

const _getDirty = (obj) => {
  return Object.values(obj).reduce((m, c) => {
    if (c["dirty"] == true) m.push(c);
    return m;
  }, []);
}

export default createStore(
  todos,
  _initialState,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  ),
);
