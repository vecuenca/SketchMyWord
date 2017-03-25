/*jshint esversion: 6 */
var model = (function() {
  "use strict";

	var headers = new Headers({
		'Content-Type': 'application/json'
	});

  var model = {};

  model.signIn = data => {
    return fetch('/api/signin/', {
			method: 'post',
			credentials: 'include',
			headers: headers,
			body: JSON.stringify({
				username: data.username, 
				password: data.password
			})
		}).then(resp => {
			if (resp.status == 401 || resp.status == 400) {
				return resp.json().then(err => {
					return Promise.reject(err);
				});
			} 
			return resp.json();
		})
  };

	model.signUp = data => {
    return fetch('/api/users/', {
			method: 'put',
			credentials: 'include',
			headers: headers,
			body: JSON.stringify({
				username: data.username, 
				password: data.password
			})
		}).then(resp => {
			if(resp.status == 400) {
				return resp.json().then(err => {
					return Promise.reject(err);
				});
			}
			return resp.json();
		})
  };  

  return model;
}());