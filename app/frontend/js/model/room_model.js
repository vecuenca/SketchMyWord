/*jshint esversion: 6 */
var roomModel = (function () {
  "use strict";

  var headers = new Headers({
    'Content-Type': 'application/json'
  });

  var roomModel = {};

  roomModel.createRoom = data => {
    return fetch('/api/game/', {
      method: 'put',
      credentials: 'include',
      headers: headers,
      body: JSON.stringify({
        roomSize: data.roomSize
      })
    }).then(resp => {
      if (resp.status == 403) {
        return resp.json().then(err => {
          return Promise.reject(err);
        });
      }
      return resp.json();
    })
  };

  roomModel.joinRoom = data => {
    return fetch('/api/game/' + data.roomId, {
      method: 'post',
      credentials: 'include',
      headers: headers
    }).then(resp => {
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(err => {
          return Promise.reject(err);
        });
      }
      return resp.json();
    })
  };

  roomModel.leaveRoom = data => {
    return fetch('/api/game/' + data.roomId, {
      method: 'delete',
      credentials: 'include',
      headers: headers
    }).then(resp => {
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(err => {
          return Promise.reject(err);
        });
      }
      return resp.json();

    })
  }

  roomModel.getRooms = () => {
    return fetch('/api/game', {
      method: 'get',
      credentials: 'include',
      headers: headers
    }).then(resp => {
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(err => {
          return Promise.reject(err);
        });
      }
      return resp.json();
    })
  }

  return roomModel;
}());