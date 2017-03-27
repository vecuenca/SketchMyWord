/*jshint esversion: 6 */
var view = (function () {
	"use strict";

	$('#references_link').click(e => {
		$('#references').modal('open');
	});

	var view = {};

	document.getElementById('signin').onsubmit = function (e) {
		e.preventDefault();

		var username = document.getElementById('signin-username').value;
		var password = document.getElementById('signin-password').value;

		if (password.length < 6) {
			util.displayToast('Your password is too short.');
		} else if (username.length > 0 && password.length > 0) {
			var event = new CustomEvent('onSignIn', {
				detail: {
					username: username,
					password: password
				}
			});
			document.dispatchEvent(event);
			document.getElementById('signin').reset();
		} else {
			util.displayToast('Please enter a username or password');
		}
	}

	document.getElementById('signup').onsubmit = function (e) {
		e.preventDefault();

		var username = document.getElementById('signup-username').value;
		var password = document.getElementById('signup-password').value;
		var passwordConfirm = document.getElementById('signup-confirm-password').value;

		if (username.length == 0 && password.length == 0 && passwordConfirm.length == 0) {
			util.displayToast('Please fill in all fields.');
		} else if (password !== passwordConfirm) {
			util.displayToast('Your passwords don\'t match.');
		} else if (password.length < 6 || passwordConfirm.length < 6) {
			util.displayToast('Your password is too short');
		} else {
			var event = new CustomEvent('onSignUp', {
				detail: {
					username: username,
					password: password,
					passwordConfirm: passwordConfirm
				}
			});
			document.dispatchEvent(event);
			document.getElementById('signup').reset();
		}
	}

	view.signUpSuccess = function () {
		util.displayToast('Your user was created successfully!');
		$('ul.tabs').tabs('select_tab', 'signin');
	}

	return view;

}());