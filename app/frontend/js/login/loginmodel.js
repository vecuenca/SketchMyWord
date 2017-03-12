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
				callback('The username or password you entered is incorrect.', resp);
			} else {
				callback(null, resp);
			}
		}).catch(function(err) {
			callback(err, null);
		});
  };

	model.signUp = function(data, callback) {
    fetch('/api/users/', {
			method: 'put',
			credentials: 'include',
			headers: headers,
			body: JSON.stringify({
				username: data.username, 
				password: data.password
			})
		}).then(function(resp) {
			callback(null, resp);
		}).catch(function(err) {
			callback(err, null);
		});
  };  

  return model;
}());