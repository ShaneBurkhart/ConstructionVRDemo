import $ from 'jquery';
import _ from 'underscore';

var _dispatch = null;

const ActionCreator = {
  load: () => {
    $.ajax({
      type: "GET",
      url: `/api2/project/${PROJECT_ACCESS_TOKEN}/finishes`,
      dataType: "json",
      success: (data) => {
        console.log({data})
        _dispatch({ type: "LOAD", data: data });
      },
      error: (data) => {
        console.error("could not fetch project data");
        _dispatch({ type: "API_ERROR", data: data });
      }
    })
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
      success: callback,
      // error: errorCallback,
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
      success: callback,
      // error: errorCallback
    });
  },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
};

export default ActionCreator;
