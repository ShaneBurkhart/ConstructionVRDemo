import $ from 'jquery';
import store from './store'
import Actions from './actions'

function dispatch_project_callback(data) {
  store.dispatch({
    type: Actions.UPDATE_PROJECT,
    ...data
  })
  store.dispatch({ type: Actions.LOADING, isLoading: false })
}

export default {
  load: () => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN, dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  },

  openEditOptionModal: (optionId) => ({
    type: Actions.OPEN_MODAL,
    modal: "editOptionId",
    id: optionId,
  }),

  closeEditOptionModal: () => ({
    type: Actions.CLOSE_MODAL,
    modal: "editOptionId"
  }),

  unlinkOption: (selectionId, optionId) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/selection/",
      selectionId, "/option/", optionId, "/unlink" ].join("");

    $.post(url, dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  },

  saveOption: (optionId, optionValues) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/option/save"].join("");

    $.post(url, optionValues, (data) => {
      dispatch_project_callback(data);
    });

    store.dispatch({ type: Actions.CLOSE_MODAL, modal: "editOptionId" });
    return { type: Actions.LOADING, isLoading: true }
  }
}
