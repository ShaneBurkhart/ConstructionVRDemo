import $ from 'jquery';
import store from './store'
import Actions from './actions'
import _  from 'underscore'

function dispatch_project_callback(data) {
  store.dispatch({
    type: Actions.UPDATE_PROJECT,
    ...data
  })
  store.dispatch({ type: Actions.LOADING, isLoading: false })
}

function dispatch_search_results_callback(data) {
  store.dispatch({
    type: Actions.UPDATE_SEARCH_RESULTS,
    ...data
  })
  store.dispatch({ type: Actions.LOADING, isLoading: false })
}

function searchRquest(search) {
  $.get(
    "/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes/options/search",
    { s: search },
    dispatch_search_results_callback
  );
}

var debouncedSearchRequest = _.debounce(searchRquest, 500);

export default {
  load: () => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN, dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  },

  searchForOptions: (search) => {
    debouncedSearchRequest(search);
    return { type: Actions.LOADING, isLoading: true }
  },

  openSelectionModal: (selectionId) => ({
    type: Actions.OPEN_MODAL,
    modal: "selectingForSelectionId",
    id: selectionId,
  }),

  closeSelectionModal: () => ({
    type: Actions.CLOSE_MODAL,
    modal: "selectingForSelectionId"
  }),

  openEditOptionModal: (optionId) => ({
    type: Actions.OPEN_MODAL,
    modal: "editOptionId",
    id: optionId,
  }),

  closeEditOptionModal: () => ({
    type: Actions.CLOSE_MODAL,
    modal: "editOptionId"
  }),

  linkOptionToSelection: (optionId, selectionId) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/selection/",
      selectionId, "/option/", optionId, "/link" ].join("");

    $.post(url, dispatch_project_callback);
    store.dispatch({ type: Actions.CLOSE_MODAL, modal: "selectingForSelectionId" });
    return { type: Actions.LOADING, isLoading: true }
  },

  removeSelection: (selectionId) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/selection/",
      selectionId, "/remove" ].join("");

    $.post(url, dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  },

  unlinkOption: (selectionId, optionId) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/selection/",
      selectionId, "/option/", optionId, "/unlink" ].join("");

    $.post(url, dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  },

  saveOption: (optionValues, selectionId) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/option/save"].join("");
    $.post(url, optionValues, (data) => {
      dispatch_project_callback(data);
    });

    store.dispatch({ type: Actions.CLOSE_MODAL, modal: "selectingForSelectionId" });
    store.dispatch({ type: Actions.CLOSE_MODAL, modal: "editOptionId" });
    return { type: Actions.LOADING, isLoading: true }
  }
}
