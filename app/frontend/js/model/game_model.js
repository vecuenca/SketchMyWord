/*jshint esversion: 6 */
var gameModel = (function () {
  "use strict";

  var headers = new Headers({
    'Content-Type': 'application/json'
  });

  var gameModel = {};

  gameModel.isActive = roomId => {
    return fetch('/api/game/' + roomId, {
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
  };

  return gameModel;
}());