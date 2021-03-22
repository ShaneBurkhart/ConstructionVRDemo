import $ from 'jquery';
import _ from 'underscore';

var _dispatch = null;

const ActionCreator = {
  load: () => {
    $.ajax({
      type: "GET",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}`,
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

  submitNewFinish: (newFinish, onSuccess, onError) => {
    $.ajax({
      type: "POST",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}`,
      data: newFinish,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "NEW_FINISH", data })
        onSuccess({ status: 200, message: `New Finish added` })
      },
      error: (error) => {
        console.error(error);
        onError();
      }
    });
  },

  updateFinish: (finish, onSuccess, onError) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}/${finish.id}`,
      data: finish,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "UPDATE_FINISH", data })
        onSuccess({ status: 200, message: `Finish ${finish.Name} updated` })
      },
      error: (error) => {
        console.error(error);
        onError();
      }
    });
  },

  deleteFinish: (finishId, onSuccess, onError) => {
    $.ajax({
      type: "DELETE",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}/${finishId}`,
      data: finishId,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "DELETE_FINISH", data })
        onSuccess({ status: 200, message: `Finish id#${data} deleted` })
      },
      error: (error) => {
        console.error(error);
        onError();
      }
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
