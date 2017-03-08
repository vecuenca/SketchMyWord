/*jshint esversion: 6 */
var view = (function() {
  "use strict";

  var view = {};

	document.getElementById('signin').onsubmit = function(e) {
		e.preventDefault();
		
		var username = document.getElementById('signin-username').value;
		var password = document.getElementById('signup-password').value;

		if (username.length > 0 && password.length > 0) {
			var event = new CustomEvent('onSignIn', {
				detail: {
					username: username,
					password: password
				}
			});
			document.dispatchEvent(event);
			document.getElementById('signin').reset();
		} else {
			view.displayError('Please enter a username or password');
		}
	}

	view.displayError = function(errorMsg) {
		document.getElementById('error').innerHTML = errorMsg;
	}

  return view;

}());