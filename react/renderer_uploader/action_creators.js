import $ from 'jquery';
import Actions from '../../common/actions';
import _ from 'underscore';

var _dispatch = null;

const dispatch = (action) => {
  if (_dispatch) _dispatch(action);
}

const ActionCreator = {
  load: () => {
    const renderer_app_get_projects = "24621eed-e87b-4422-b67f-a4ba513b47f2"
    $.ajax({
      type: "GET",
      url: `/${renderer_app_get_projects}`,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "LOAD", data: data });
      },
      error: (data) => {
        console.error("could not fetch project data");
        _dispatch({ type: "API_ERROR", data: data });
      }
    })
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
