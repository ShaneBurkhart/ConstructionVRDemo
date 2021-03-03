import $ from 'jquery';
var _dispatch = null;
const ActionCreator = {
  load: (page=1) => {
    $.ajax({
      type: "GET",
      url: `/api2/admin/users`,
      dataType: "json",
      success: (data) => {
        _dispatch({ type: "LOAD", data: data });
      },
      error: (data) => {
        // callback({status: data.status, message: data.responseJSON.msg})
        _dispatch({ type: "API_ERROR", data: data });
      }
    })
  },

  inviteUser: (user, callback, errorCallback) => {
    $.ajax({
      type: "POST",
      url: "/api2/admin/invite-user",
      data: { username: user.username, email: user.email, role: user.role },
      dataType: "json",
      success: (data) => {
        _dispatch({type: "INVITE_USER", data: data})
        callback({status: 200, message: `Sent invite to ${data.email}`})
      },
      error: (data) => {
        _dispatch({ type: "API_ERROR", data: data });
        data.status === 422 && errorCallback({
          status: data.status,
          message: data.responseJSON.msg
        })
      }
    });
  },

  // updateUser: (user, callback, errorCallback) => {
  //   $.ajax({
  //     type: "POST",
  //     url: `/api/admin/users/${user.id}`,
  //     data: {
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       username: user.username,
  //       email: user.email,
  //       role: user.role,
  //       id: user.id,
  //     },
  //     dataType: "json",
  //     success: (data) => {
  //       callback(data);
  //       _dispatch({type: "UPDATE_USER", data: data});
  //     },
  //     error: (data) => {
  //       _dispatch({ type: "API_ERROR", data: data });
  //       data.status === 422 && errorCallback({
  //         status: data.status,
  //         message: data.responseJSON.msg
  //       })
  //     }
  //   });
  // },

  // deleteUser: (userId, callback) => {
  //   $.ajax({
  //     type: "DELETE",
  //     url: `/api/admin/users/${userId}/delete`,
  //     dataType: "json",
  //     success: (data) => {
  //       _dispatch({type: "DELETE_USER", data: data})
  //       callback()
  //     },
  //     error: (data) => {
  //       _dispatch({ type: "API_ERROR", data: data });
  //     }
  //   });
  // },

  updateDispatch: (dispatch) => {
    _dispatch = dispatch;
  }
}

export default ActionCreator;
