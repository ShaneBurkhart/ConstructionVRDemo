import $ from 'jquery';
import Actions from './actions'
import _  from 'underscore'

const ActionCreator = {
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

  reorderCategories: (orderedCategoryIds) => {
    return {
      type: Actions.REORDER_CATEGORIES,
      orderedCategoryIds
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

  updateEach: (updates, noDirty = false) => {
    console.log(noDirty);
    return {
      type: Actions.EACH_UPDATE,
      ...updates,
      noDirty
    }
  },

  searchOptions: (query, callback) => {
    $.get("/api/finishes/options/search?q=" + encodeURIComponent(query), callback);
  },

  saveToServer: (diff) => {
    console.log('save to server');
    return (dispatch) => {
      console.log('save to server');

      $.post({
        url: "/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes/save",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ ...diff }),
        dataType: "json",
        success: (data) => {
          dispatch(ActionCreator.updateEach(data, true));
        }
      });
    };
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
};

export default ActionCreator;
