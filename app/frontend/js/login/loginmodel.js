/*jshint esversion: 6 */
var model = (function() {
  "use strict";

	var headers = new Headers({
		'Content-Type': 'application/json'
	});
  var model = {};

  model.signIn = function(data, callback) {
    fetch('/api/signin/', {
			method: 'post',
			credentials: 'include',
			headers: headers,
			body: JSON.stringify({
				username: data.username, 
				password: data.password
			})
		}).then(function(resp) {
			if (resp.status == 401) {
				callback(resp, resp.statusText);
			} else {
				callback(resp, null);
			}
		}).catch(function(err) {
			callback(null, err);
		});
  };

	model.signUp = function(data, callback) {
    fetch('/api/users/', {
			method: 'put',
			body: {
				username: data.username, 
				password: data.password
			}
		}).then(function(resp) {
			callback(resp, null);
		}).catch(function(err) {
			callback(null, err);
		});
  };  

  return model;
}());