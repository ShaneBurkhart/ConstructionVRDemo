import $ from 'jquery';
import Actions from './actions'
import _  from 'underscore'

export default {
  load: (callback) => {
    return (dispatch) => {
      $.get("/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes", (data) => {
        dispatch({
          type: Actions.FULL_UPDATE,
          ...data
        });
        callback(data);
      });
    }
  },

  updateFilter: (filter) => {
    return {
      type: Actions.UPDATE_FILTER,
      filter,
    }
  },

  moveSelection: (selectionId, source, destination) => {
    return {
      type: Actions.MOVE_SELECTION,
      selectionId, source, destination,
    }
  },

  moveOption: (optionId, source, destination) => {
    return {
      type: Actions.MOVE_OPTION,
      optionId, source, destination,
    }
  },

  updateEach: (updates) => {
    return {
      type: Actions.EACH_UPDATE,
      ...updates
    }
  },

  searchOptions: (query, callback) => {
    $.get("/api/finishes/options/search?q=" + encodeURIComponent(query), callback);
  },

  save: (categories, callback) => {
    console.log("Saving...", categories);

    $.post({
      url: "/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes/save",
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ categories: categories }),
      dataType: "json",
      success: callback
    });
  },

  presignedURL: (file, callback) => {
    $.ajax({
      type: "POST",
      url: "/api/temp_upload/presign",
      data: {
        filename: file.name,
        mime: file.type,
      },
      dataType: "json",
      success: callback
    });
  },

  uploadFile: (file, presignedURL, callback) => {
    $.ajax({
      type: "PUT",
      url: presignedURL,
      data: file,
      dataType: "text",
      cache : false,
      contentType : file.type,
      processData : false,
      success: callback
    });
  }
}
