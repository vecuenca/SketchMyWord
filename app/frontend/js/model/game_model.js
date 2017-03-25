/*jshint esversion: 6 */
var gameModel = (function () {
  "use strict";

  var headers = new Headers({
    'Content-Type': 'application/json'
  });

  var gameModel = {};

  gameModel.isActive = function (roomId) {
    return fetch('/api/game/' + roomId, {
      method: 'get',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        return resp.json().then(function(err){
          return Promise.reject(err);
        });
      } else {
        return resp.json();
      }
    })
  };

  return gameModel;
}());