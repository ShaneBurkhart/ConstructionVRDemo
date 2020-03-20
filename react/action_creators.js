import $ from 'jquery';
import Actions from '../common/actions'
import _  from 'underscore'

var socket = require('socket.io-client')('http://127.0.0.1:3001');
var _dispatch = null;

socket.on('connect', function(){
  console.log("New connection established.");
});
socket.on('disconnect', function(){
  console.log("No connection/dropped.");
});
socket.on(Actions.EXECUTE_CLIENT_EVENT, function(data){
  if (_dispatch) _dispatch(data);
});

let _isSaving = false;

const _saveToServer = (dispatch, diff) => {
  if (_isSaving) return;
  _isSaving = true;
  console.log('sending to server...');

  $.post({
    url: "/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes/save",
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({ ...diff }),
    dataType: "json",
    success: (data) => {
      _isSaving = false;
      dispatch(ActionCreator.updateEach(data, true));
    }
  });
};

const emit = (event, data) => {
  socket.emit(event, { project_token: PROJECT_ACCESS_TOKEN, ...data });
};

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

  addNewSelection: (categoryId) => {
    emit(Actions.ADD_NEW_SELECTION, { categoryId });
  },

  addNewCategory: (categoryName) => {
    emit(Actions.ADD_NEW_CATEGORY, { categoryName });
  },

  removeSelection: (selectionId) => {
    emit(Actions.REMOVE_SELECTION, { selectionId });
  },

  removeCategory: (categoryId) => {
    emit(Actions.REMOVE_CATEGORY, { categoryId });
  },

  updateSelection: (selectionId, fieldsToUpdate) => {
    emit(Actions.UPDATE_SELECTION, { selectionId, fieldsToUpdate });
  },

  updateCategory: (categoryId, fieldsToUpdate) => {
    emit(Actions.UPDATE_CATEGORY, { categoryId, fieldsToUpdate });
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

  updateModal: (modals) => {
    return { type: Actions.UPDATE_MODAL, modals };
  },

  updateEach: (updates, serverUpdate = false) => {
    if (serverUpdate) console.log("SERVER_UPDATE");
    return {
      type: Actions.EACH_UPDATE,
      ...updates,
      serverUpdate,
    }
  },

  searchOptions: (query, callback) => {
    $.get("/api/finishes/options/search?q=" + encodeURIComponent(query), callback);
  },

  saveToServer: (diff) => {
    console.log('saveToServer()');
    //return (dispatch) => { _saveToServer(dispatch, diff) };
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
  },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
};

export default ActionCreator;
