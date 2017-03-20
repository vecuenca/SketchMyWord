(function(roomView, roomModel, gameView, gameModel, util){
	"use strict";

	// Room functions
	document.addEventListener('onCreateRoom', function (e) {
		roomModel.createRoom(e.detail, function (err, resp) {
			// TODO: REFACTOR THIS
			if (err) return util.displayToast(err);
			resp.json().then(function(data) {
				roomView.roomCreateSuccess(data.roomId);
			});
		});
	});

	document.addEventListener('onRoomJoin', function (e) {
		var roomId = e.detail.roomId;
		// TODO: REFACTOR THIS
		roomModel.joinRoom(e.detail, function (err, resp) {
			if (err) return util.displayToast(err);
			resp.json().then(function(data) {
				console.log('JOIN DATA', data);
				roomView.roomJoinSuccess(roomId);
			});
		});
	});

	document.addEventListener('onLeaveRoom', function(e) {
		var roomId = e.detail.roomId;
		roomModel.leaveRoom(e.detail, function(err, resp) {
			if (err) return util.displayToast(err);
			resp.json().then(function(data) {
				roomView.roomLeaveSuccess(data);
			});
		});
	});

	document.addEventListener('onGetRooms', function(e) {
		roomModel.getRooms(function(err, res) {
			if (err) return util.displayToast(err);
			res.json().then(function(data) {
				roomView.displayRoomListInModal(data.rooms);
			});
		});
	});

	// Game functions
	document.addEventListener('displayGame', function(e) {
		roomView.hide();
		gameView.display();
		gameView.setup(e.detail.socket);
	});

}(roomView, roomModel, gameView, gameModel, util));