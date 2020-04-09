import $ from 'jquery';
import Actions from '../common/actions'
import _  from 'underscore'

var socket = require('socket.io-client')({
  path: "/d30c4db9-008a-42ce-bbc2-3ec95d8c2c45",
  query: { projectAccessToken: PROJECT_ACCESS_TOKEN }
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

const dispatch = (action) => {
  if (_dispatch) _dispatch(action);
}

const emit = (event, data) => {
  console.log("Emitting: ", event, data);
  socket.emit(event, { project_token: PROJECT_ACCESS_TOKEN, ...data });
};

const ActionCreator = {
  load: (callback) => {
    return (dispatch) => {
      $.get("/api2/project/" + PROJECT_ACCESS_TOKEN + "/finishes", (data) => {
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

  addNewSelection: (categoryId, fields) => {
    emit(Actions.ADD_NEW_SELECTION, { categoryId, fields });
  },

  addNewCategory: (categoryName) => {
    emit(Actions.ADD_NEW_CATEGORY, { categoryName });
  },

  removeOption: (optionId) => {
    emit(Actions.REMOVE_OPTION, { optionId });
  },

  removeSelection: (selectionId) => {
    emit(Actions.REMOVE_SELECTION, { selectionId });
  },

  removeCategory: (categoryId) => {
    emit(Actions.REMOVE_CATEGORY, { categoryId });
  },

  updateOption: (optionId, fieldsToUpdate, updateAll) => {
    emit(Actions.UPDATE_OPTION, { optionId, fieldsToUpdate, updateAll });
  },

  updateSelection: (selectionId, fieldsToUpdate) => {
    emit(Actions.UPDATE_SELECTION, { selectionId, fieldsToUpdate });
  },

  updateCategory: (categoryId, fieldsToUpdate) => {
    emit(Actions.UPDATE_CATEGORY, { categoryId, fieldsToUpdate });
  },

  alphabetizeSelections: (categoryId) => {
    emit(Actions.ALPHABETIZE_SELECTIONS, { categoryId });
  },

  moveOption: (optionId, destSelectionId, newPosition) => {
    dispatch({ type: Actions.MOVE_OPTION, optionId, destSelectionId, newPosition });
    emit(Actions.MOVE_OPTION, { optionId, destSelectionId, newPosition });
  },

  moveSelection: (selectionId, destCategoryId, newPosition) => {
    dispatch({ type: Actions.MOVE_SELECTION, selectionId, destCategoryId, newPosition });
    emit(Actions.MOVE_SELECTION, { selectionId, destCategoryId, newPosition });
  },

  moveCategory: (categoryId, newPosition) => {
    dispatch({ type: Actions.MOVE_CATEGORY, categoryId, newPosition });
    emit(Actions.MOVE_CATEGORY, { categoryId, newPosition });
  },

  updateFilters: (filters) => {
    return {
      type: Actions.UPDATE_FILTERS,
      filters,
    }
  },

  updateModal: (modals) => {
    return { type: Actions.UPDATE_MODAL, modals };
  },

  searchOptions: (query, callback) => {
    $.get("/api2/finishes/options/search?q=" + encodeURIComponent(query), callback);
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
