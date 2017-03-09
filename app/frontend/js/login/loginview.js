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
			view.displayToast('Please enter a username or password');
		}
	}

	document.getElementById('signup').onsubmit = function(e) {
		e.preventDefault();

		var username = document.getElementById('signup-username').value;
		var password = document.getElementById('signup-password').value;
		var passwordConfirm = document.getElementById('signup-confirm-password').value;

		if (username.length == 0 && password.length == 0 && passwordConfirm.length == 0) {
			view.displayToast('Please fill in all fields.');
		} else if (password !== passwordConfirm) {
			view.displayToast('Your passwords don\'t match.');
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

	view.displayToast = function(msg) {
		Materialize.toast(msg, 5000);
	}

  return view;

}());