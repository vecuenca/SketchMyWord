(function (preloaderView, roomView, gameView, util) {
	"use strict";

	$('#references_link').click(e =>{
		$('#references').modal('open');
	});

	window.onload = function () {
		// run onloads of each view component.
		// this initializes things like onsubmits, onclicks, etc.
		roomView.onload();
		gameView.onload();

		$("#btn-logout").click(function(){
			util.deleteCookie('roomId');
		});
		// initially, user will only see the roomView.
		// gameView is displayed once we are actually in a game
		// roomView.hide();
		// gameView.hide();


		// initially, user will only see the roomView.
		// gameView is displayed once we are actually in a game


		// populate app bar username with logged in user
		var cookieUser = util.str_obj(document.cookie).username;
		$('#header-username')[0].innerHTML += cookieUser;
	};

}(preloaderView, roomView, gameView, util));