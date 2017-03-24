/*jshint esversion: 6 */
var gameModel = (function() {
  "use strict";

	var headers = new Headers({
		'Content-Type': 'application/json'
	});

  var gameModel = {};

  gameModel.isActive = function(roomId){
    fetch('/api/game/' + roomId, {
      method: 'get',
      credentials: 'include',
      headers: headers
    }).then(function (resp) {
      if (resp.status == 403 || resp.status == 400) {
        return util.displayToast(resp);
      } else {
        return resp.json().then(function(data){
          return data.active;
        });
      }
    }).catch(function (err) {
      callback(err, null);
    });
  }

  return gameModel;
}());