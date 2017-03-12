(function(roomView, roomModel, gameView, gameModel, util){
	"use strict";

	// Room functions
	document.addEventListener('onCreateRoom', function (e) {
		roomModel.createRoom(e.detail, function (err, resp) {
			// TODO: REFACTOR THIS
			resp.json()
			.then(function(data) {
				roomView.roomCreateSuccess(data.roomId);
			});
			if (err) return util.displayToast(err);
		});
	});

	document.addEventListener('onRoomJoin', function (e) {
		var roomId = e.detail.roomId;
		// TODO: REFACTOR THIS
		roomModel.joinRoom(e.detail, function (err, resp) {
			resp.json()
			.then(function(data) {
				console.log('JOIN DATA', data);
				roomView.roomJoinSuccess(roomId);
			});
			if (err) return util.displayToast(err);
		});
	});

	// Game functions
	document.addEventListener('displayGame', function(e) {
		roomView.hide();
		gameView.display();
		gameView.setup(e.detail.socket);
	});

}(roomView, roomModel, gameView, gameModel, util));