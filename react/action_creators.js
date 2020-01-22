import $ from 'jquery';
import Actions from './actions'
import _  from 'underscore'

export default {
  load: (callback) => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes", callback);
  }
}
