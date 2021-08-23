import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const _initialState = {
  projectId: null,
  projectName: "",
  projectDocUrl: "",
  apiError: {},
  plans: [],
  finishes: [],
  newestFinish: {},
  finishLibrary: [],
  lockedCategories: [],
  categoriesHiddenFromPrint: {},
};

let unchangedFinishes;


const todos = (state = {}, action) => {
  switch (action.type) {
    case "LOAD":
      const { finishes, projectId, projectName, projectDocUrl, lockedCategories, plans } = action.data;
      return { ...state, finishes, projectId, projectName, projectDocUrl, lockedCategories, plans };
    
    case "NEW_FINISH":
      return { ...state, finishes: [...state.finishes, action.data], newestFinish: action.data };
    
    case "UPDATE_FINISH":
      unchangedFinishes = [...state.finishes.filter(f => f.id !== action.data.id)];
      return { ...state, finishes: [...unchangedFinishes, action.data]};
    
    case "UPDATE_FINISH_ORDERS":
      unchangedFinishes = [...state.finishes.filter(f => f.category !== action.data.category)];
      return { ...state, finishes: [...unchangedFinishes, ...action.data.newOrderedFinishes]};
    
    case "UPDATE_FINISH_LIBRARY":
      return { ...state, finishLibrary: [...action.data]};
    
    case "UPDATE_PROJECT_NAME":
      return { ...state, projectName: action.data};
    
    case "UPDATE_LOCKED_CATEGORIES":
      return { ...state, lockedCategories: action.data.lockedCategories};
    
    case "UPDATE_PRINT_CATEGORIES":
      return { ...state, categoriesHiddenFromPrint: action.nextHiddenCategories};
    
    case "UPDATE_PROJECT_DOCUMENT":
      return { ...state, projectDocUrl: action.projectDocUrl};
         
    case "NEW_PLAN":
      return { ...state, plans: [...state.plans, action.data] };

    case 'API_ERROR':
      return { ...state, apiError: {
        status: action.data ? action.data.status : 404,
        message: action.data ? action.data.responseText : "Could not complete request",
      }};

    case 'CLEAR_API_ERROR':
      return { ...state, apiError: {}};

    default:
      return state;
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
