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
      url: "/api2/v2/uploads/presigned_url",
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

  uploadLargeFile: (file, presignedURL, callback, errorCallback, onProgress) => {
    $.ajax({
      xhr: function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt) {
          if (evt.lengthComputable) {
              var percentComplete = (evt.loaded / evt.total) * 100;
              onProgress(Math.round(percentComplete))
          }
        }, false);
        return xhr;
      },
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
      success: ({ newName }) => {
        _dispatch({ type: "UPDATE_PROJECT_NAME", data: newName })
      },
      error: (error) => {
        // onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  addEditProjectDoc: (documentUrl, onSuccess, onError) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/project/add_doc/${PROJECT_ACCESS_TOKEN}`,
      data: {documentUrl},
      success: ({projectDocUrl}) => {
        onSuccess();
        _dispatch({ type: "UPDATE_PROJECT_DOCUMENT", projectDocUrl })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  addNewPlan: (planData, onSuccess, onError) => {
    $.ajax({
      type: "POST",
      url: `/api2/v2/plans/${PROJECT_ACCESS_TOKEN}`,
      data: planData,
      success: ({ newPlan }) => {
        onSuccess();
        _dispatch({ type: "NEW_PLAN", data: newPlan });
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  updatePlan: (planId, planData, onSuccess, onError) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/plans/${PROJECT_ACCESS_TOKEN}/${planId}`,
      data: planData,
      success: (plans) => {
        onSuccess();
        _dispatch({ type: "UPDATE_PLANS", data: plans })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  toggleArchivePlan: (planId, onSuccess, onError) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/plans/${PROJECT_ACCESS_TOKEN}/${planId}/archive`,
      success: (plans) => {
        onSuccess();
        _dispatch({ type: "UPDATE_PLANS", data: plans })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  reorderPlan: (planId, newOrderNum, onSuccess, onError) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/plans/${PROJECT_ACCESS_TOKEN}/${planId}/order`,
      data: { newOrderNum },
      success: (plans) => {
        onSuccess();
        _dispatch({ type: "UPDATE_PLANS", data: plans })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  lockCategory: (category, onSuccess, onError) => {
    $.ajax({
      type: "POST",
      url: `/api2/v2/project/lock_category/${PROJECT_ACCESS_TOKEN}`,
      data: {category},
      success: (data) => {
        onSuccess();
        _dispatch({ type: "UPDATE_LOCKED_CATEGORIES", data })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  unlockCategory: (category, onSuccess, onError) => {
    $.ajax({
      type: "DELETE",
      url: `/api2/v2/project/unlock_category/${PROJECT_ACCESS_TOKEN}`,
      data: {category},
      success: (data) => {
        onSuccess();
        _dispatch({ type: "UPDATE_LOCKED_CATEGORIES", data })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  updatePrintCategories: (nextHiddenCategories) => {
    _dispatch({ type: "UPDATE_PRINT_CATEGORIES", nextHiddenCategories })
  },

  searchFinishLibrary: (query, data, onSuccess, onError) => {
    $.ajax({
      type: "PUT",
      url: `/api2/v2/finishes/search?q=${encodeURIComponent(query)}`,
      data: JSON.stringify(data),
      contentType: "application/json",
      success: (data) => {
        const results = data.results || [];
        onSuccess();
        _dispatch({ type: "UPDATE_FINISH_LIBRARY", data: results.map(r => ({...r.attributes, id: r.id})) })
      },
      error: (error) => {
        onError();
        _dispatch({ type: "API_ERROR", data: error });
      }
    })
  },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
};

export default ActionCreator;
