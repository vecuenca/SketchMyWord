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
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(function(err) {
          return Promise.reject(err);
        });
      } else {
        return resp.json();
      }
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
        return resp.json().then(function(err) {
          return Promise.reject(err);
        });
      } else {
        return resp.json();
      }
    });
  };

  roomModel.getRooms = function (callback) {
    fetch('/api/game', {
      method: 'get',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(function(err) {
          return Promise.reject(err);
        });
      } else {
        return resp.json();
      }
    });
  }

  roomModel.leaveRoom = function(data, callback) {
    fetch('/api/game/' + data.roomId, {
      method: 'delete',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(function(err) {
          return Promise.reject(err);
        });
      } else {
        return resp.json();
      }
    });
  }

  return roomModel;
}());