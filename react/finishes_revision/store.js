import { createStore, applyMiddleware, compose } from 'redux';
import Actions from '../../common/actions';
import thunk from 'redux-thunk';

const _initialState = {
  adminMode: false,
  filters: {
    locations: null,
  },
  modals: {},
};


const todos = (state = {}, action) => {
  switch (action.type) {
    case "LOAD":
      const { admin_mode } = action.data;
      return { ...state, adminMode: admin_mode };

      // case 'FULL_UPDATE':
      //   const filters = state.filters;
      //   const options = indexByID(action.options);
  
      //   Object.keys(options).forEach(optionId => {
      //     const optionImages = action.optionImages.reduce((memo, oi) => {
      //       if (oi.OptionId == optionId) memo.push(oi); return memo;
      //     }, [])
      //     options[optionId].Images = optionImages;
      //   });
  
      //   return {
      //     ...state,
      //     ...computeState({ filters, options, selections, categories }),
      //     isAdmin: action.admin_mode,
      //   } 

    // case "NEW_PROJECT":
    //   return {  ...state, projects: [ ...state.projects, action.data ] };

    // case "UPDATE_PROJECT":
    //   return { ...state, projects: [ ...state.projects.filter(p => p.id !== action.data.id), action.data]}

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
