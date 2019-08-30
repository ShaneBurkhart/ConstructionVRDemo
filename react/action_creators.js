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
    type: Actions.OPEN_EDIT_OPTIONS_MODAL,
    id: optionId,
  }),

  unlinkOption: (selectionId, optionId) => {
    const url = [ "/api/project/", PROJECT_ACCESS_TOKEN, "/finishes/selection/",
      selectionId, "/option/", optionId, "/unlink" ].join("");

    $.post(url, dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  },
}
