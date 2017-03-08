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

	document.getElementById('signup').onsubmit = function(e) {
		e.preventDefault();

		var username = document.getElementById('signin-username').value;
		var password = document.getElementById('signup-password').value;
		var passwordConfirm = document.getElementById('signup-confirm-password').value;

		if (username.length == 0 && password.length == 0 && passwordConfirm.length == 0) {
			view.displayError('Please fill in all fields.');
		} else if (password !== passwordConfirm) {
			view.displayError('Your passwords don\'t match.');
		} else {
			var event = new CustomEvent('onSignUp', {
				detail: {
					username:        username,
					password:        password,
					passwordConfirm: passwordConfirm
				}
			});
			document.dispatchEvent(event);
			document.getElementById('signup').reset();
		}
	}

	view.displayError = function(errorMsg) {
		Materialize.toast(errorMsg, 5000);
	}

  return view;

}());