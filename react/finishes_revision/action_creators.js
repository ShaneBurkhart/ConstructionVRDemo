import $ from 'jquery';

var _dispatch = null;

const clearError = () => setTimeout(() => {
  _dispatch({ type: "CLEAR_API_ERROR" })
}, 3100);

const ActionCreator = {
  load: () => {
    $.ajax({
      type: "GET",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}`,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "LOAD", data: data });
      },
      error: (error) => {
        _dispatch({ type: "API_ERROR", data: error });
        clearError();
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
        _dispatch({ type: "NEW_FINISH", data });
        onSuccess();
        
        const el = document.getElementById(`finishCard-${data.id}`);
        el.classList.add('fade-out-bg');
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
        setTimeout(() => {
          el.classList.remove('fade-out-bg');
        }, 3200);
      
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
        clearError();
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
        onError();
        _dispatch({ type: "API_ERROR", data: error });
        clearError();
      }
    });
  },

  updateFinishOrders: (finish) => {
    $.ajax({
      type: "PATCH",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}/${finish.id}/order`,
      data: finish,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "UPDATE_FINISH_ORDERS", data })
      },
      error: (error) => {
        _dispatch({ type: "API_ERROR", data: error });
        clearError();
      }
    });
  },

  deleteFinish: (finishId) => {
    $.ajax({
      type: "DELETE",
      url: `/api2/v2/finishes/${PROJECT_ACCESS_TOKEN}/${finishId}`,
      data: finishId,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "UPDATE_FINISH_ORDERS", data })
      },
      error: (error) => {
        _dispatch({ type: "API_ERROR", data: error });
        clearError();
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
      error: (error) => {
        _dispatch({ type: "API_ERROR" });
        clearError();
      },
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
      error: (error) => {
        _dispatch({ type: "API_ERROR" });
        clearError();
      }
    });
  },

  uploadFromUrl: (url, onSuccess, onError) => {
    $.ajax({
      type: "POST",
      url: `/api2/v2/upload/from_url`,
      data: {url},
      success: ({ imageURL }) => onSuccess(imageURL),
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
        clearError();
      }
    })
  },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
};

export default ActionCreator;
