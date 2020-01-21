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

export default {
  load: () => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes", dispatch_project_callback);
    return { type: Actions.LOADING, isLoading: true }
  }
}
