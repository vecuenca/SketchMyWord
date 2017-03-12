(function(roomView, roomModel, gameView, gameModel, util){
	"use strict";

	document.addEventListener('onCreateRoom', function (e) {
		roomModel.createRoom(e.detail, function (err, resp) {
			if (err) return util.displayToast(err);
			roomView.roomCreateSuccess(resp.roomId);
		})
	});

	document.addEventListener('onRoomJoin', function (e) {
		roomModel.joinRoom(e.detail, function (err, resp) {
			if (err) return util.displayToast(err);
			roomView.roomJoinSuccess();
		})
});

}(roomView, roomModel, gameModel, gameView, util));