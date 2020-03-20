import $ from 'jquery';
import Actions from '../common/actions'
import _  from 'underscore'

var socket = require('socket.io-client')({
  path: "/d30c4db9-008a-42ce-bbc2-3ec95d8c2c45/socket.io",
})
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

const emit = (event, data) => {
  console.log("Emitting: ", event, data);
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

  addNewOption: (selectionId, fields) => {
    emit(Actions.ADD_NEW_OPTION, { selectionId, fields });
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

  updateOption: (optionId, fieldsToUpdate) => {
    emit(Actions.UPDATE_OPTION, { optionId, fieldsToUpdate });
  },

  updateSelection: (selectionId, fieldsToUpdate) => {
    emit(Actions.UPDATE_SELECTION, { selectionId, fieldsToUpdate });
  },

  updateCategory: (categoryId, fieldsToUpdate) => {
    emit(Actions.UPDATE_CATEGORY, { categoryId, fieldsToUpdate });
  },

  moveOption: (optionId, destSelectionId, newPosition) => {
    emit(Actions.MOVE_OPTION, { optionId, destSelectionId, newPosition });
  },

  moveSelection: (selectionId, destCategoryId, newPosition) => {
    emit(Actions.MOVE_SELECTION, { selectionId, destCategoryId, newPosition });
  },

  moveCategory: (categoryId, newPosition) => {
    emit(Actions.MOVE_CATEGORY, { categoryId, newPosition });
  },

  updateFilter: (filter) => {
    return {
      type: Actions.UPDATE_FILTER,
      filter,
    }
  },

  updateModal: (modals) => {
    return { type: Actions.UPDATE_MODAL, modals };
  },

  searchOptions: (query, callback) => {
    $.get("/api/finishes/options/search?q=" + encodeURIComponent(query), callback);
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
