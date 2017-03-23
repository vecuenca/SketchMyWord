(function (roomView, gameView, util) {
	"use strict";

	window.onload = function () {
		// run onloads of each view component.
		// this initializes things like onsubmits, onclicks, etc.
		roomView.onload();
		gameView.onload();

		// initially, user will only see the roomView.
		// gameView is displayed once we are actually in a game
		roomView.display();
		gameView.hide();

		// populate app bar username with logged in user
		var cookieUser = util.str_obj(document.cookie).username;
		$('#header-username')[0].innerHTML += cookieUser;
	};
}(roomView, gameView, util));