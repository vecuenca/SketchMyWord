/*jshint esversion: 6 */
var model = (function() {
  "use strict";

  var model = {};

  model.signIn = function(data, callback) {
    fetch('/api/signin/', {
			method: 'post',
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