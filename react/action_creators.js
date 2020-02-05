import $ from 'jquery';
import Actions from './actions'
import _  from 'underscore'

export default {
  load: (callback) => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes", callback);
  },

  searchOptions: (query, callback) => {
    $.get("/api/finishes/options/search?q=" + encodeURIComponent(query), callback);
  },

  save: (categories) => {
    console.log("Saving...", categories);

    $.post({
      url: "/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes/save",
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ categories: categories }),
      dataType: "json"
    });
  }
}
