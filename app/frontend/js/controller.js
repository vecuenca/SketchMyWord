(function(roomView, roomModel, gameView, gameModel, util){
	"use strict";

	// Room functions
	document.addEventListener('onCreateRoom', function (e) {
		roomModel.createRoom(e.detail, function (err, resp) {
			resp.json()
			.then(function(data) {
				roomView.roomCreateSuccess(data.roomId);
			});
			if (err) return util.displayToast(err);
		});
	});

	document.addEventListener('onRoomJoin', function (e) {
		var roomId = e.detail.roomId;
		roomModel.joinRoom(e.detail, function (err, resp) {
			if (err) return util.displayToast(err);
			roomView.roomJoinSuccess(roomId);
		});
	});

	// Game functions
	document.addEventListener('displayGame', function(e) {
		roomView.hide();
		gameView.show();
	});

}(roomView, roomModel, gameView, gameModel, util));