import $ from 'jquery';
import Actions from '../../common/actions';
import _ from 'underscore';

var _dispatch = null;

const dispatch = (action) => {
  if (_dispatch) _dispatch(action);
}

const ActionCreator = {
  load: () => {
    const renderer_app_projects = "24621eed-e87b-4422-b67f-a4ba513b47f2"
    $.ajax({
      type: "GET",
      url: `/${renderer_app_projects}`,
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

  presignedURL: (file, callback, errorCallback) => {
    const renderer_uploader_presign = "99a0101f-2c32-4d60-9471-983372a81840";
    $.ajax({
      type: "POST",
      url: `/api/presign/${renderer_uploader_presign}`,
      data: {
        filename: file.name,
        mime: file.type,
      },
      dataType: "json",
      success: callback,
      error: errorCallback,
    });
  },

  uploadFile: (file, presignedURL, callback, errorCallback) => {
    $.ajax({
      type: "PUT",
      url: presignedURL,
      data: file,
      dataType: "text",
      cache : false,
      contentType : file.type,
      processData : false,
      success: callback,
      error: errorCallback
    });
  },

  submit: (data, callback, errorCallback) => {
    const renderer_app_projects = "24621eed-e87b-4422-b67f-a4ba513b47f2"
    $.ajax({
      type: "POST",
      url: `/${renderer_app_projects}`,
      data: {
        // filename: file.name,
        // mime: file.type,
      },
      dataType: "json",
      success: callback,
      error: errorCallback,
    });
  },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
};

export default ActionCreator;
