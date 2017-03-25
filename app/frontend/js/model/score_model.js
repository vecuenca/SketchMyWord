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
		let sortBy = data ? data.sortBy : 'games_won';
		let limit  = data ? data.limit : 10;

    fetch('/api/stats?sort=' + sortBy + '&limit=' + limit, {
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