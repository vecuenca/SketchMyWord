/*jshint esversion: 6 */
var roomModel = (function () {
  "use strict";

  var headers = new Headers({
    'Content-Type': 'application/json'
  });

  var roomModel = {};

  roomModel.createRoom = function (data, callback) {
    fetch('/api/game/', {
      method: 'put',
      credentials: 'include',
      headers: headers,
      body: JSON.stringify({
        roomSize: data.roomSize
      })
    }).then(function (resp) {
      if (resp.status == 403) {
        callback(resp, null);
      } else {
        callback(null, resp);
      }
    }).catch(function (err) {
      callback(err, null);
    });
  };
  // roomModel.createRoom = function (data) {
  //   return fetch('/api/game/', {
  //     method: 'put',
  //     credentials: 'include',
  //     headers: headers,
  //     body: JSON.stringify({
  //       roomSize: data.roomSize
  //     })
  //   }).then(function (resp) {
  //     if (resp.status == 403) {
  //       return resp.json().then(Promise.reject);
  //     } else {
  //       return resp.json();
  //     }
  //   })
  // };

  roomModel.joinRoom = function (data, callback) {
    fetch('/api/game/' + data.roomId, {
      method: 'post',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        callback(resp, null);
      } else {
        callback(null, resp);
      }
    }).catch(function (err) {
      callback(err, null);
    });
  };

  roomModel.getRooms = function (callback) {
    fetch('/api/game', {
      method: 'get',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        callback(resp, null);
      } else {
        callback(null, resp);
      }
    }).catch(function (err) {
      callback(err, null);
    });
  }

  roomModel.leaveRoom = function(data, callback) {
    fetch('/api/game/' + data.roomId, {
      method: 'delete',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        callback(resp, null);
      } else {
        callback(null, resp);
      }
    }).catch(function (err) {
      callback(err, null);
    });
  }

  return roomModel;
}());