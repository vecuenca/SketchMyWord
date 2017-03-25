/*jshint esversion: 6 */
var scoreModel = (function () {
  "use strict";

  var headers = new Headers({
    'Content-Type': 'application/json'
  });

  var scoreModel = {};

  scoreModel.fetchPersonalStats = function (data, callback) {
    fetch('/api/stats/' + data.username, {
      method: 'get',
      credentials: 'include',
      headers: headers
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

	scoreModel.fetchGlobalStats = function (data, callback) {
    fetch('/api/stats', {
      method: 'get',
      credentials: 'include',
      headers: headers
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

  return scoreModel;
}());