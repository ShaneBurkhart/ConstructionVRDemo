import $ from 'jquery';

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
      error: (error) => {
        _dispatch({ type: "API_ERROR", data: error });
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
      }
    })
  },

  changeProjectName: (projectId, newName) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/update-project-name`,
      data: {projectId, newName},
      success: (data) => console.log({data}),
      error: (error) => {
        // onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
};

export default ActionCreator;
