(function (roomView, roomModel, gameView, gameModel, util) {
	"use strict";

	var socket;

	// Room functions
	document.addEventListener('onCreateRoom', function (e) {
		roomModel.createRoom(e.detail, function (err, resp) {
			// TODO: REFACTOR THIS
			if (err) return util.displayToast(err);
			resp.json().then(function (data) {
				roomView.roomCreateSuccess(data.roomId);
			});
		});
	});

	document.addEventListener('onRoomJoin', function (e) {
		var roomId = e.detail.roomId;
		// TODO: REFACTOR THIS
		roomModel.joinRoom(e.detail, function (err, resp) {
			if (err) return util.displayToast(err);
			resp.json().then(function (data) {
				console.log('JOIN DATA', data);
				roomView.roomJoinSuccess(roomId);
			});
		});
	});

	document.addEventListener('onLeaveRoom', function (e) {
		var roomId = e.detail.roomId;
		roomModel.leaveRoom(e.detail, function (err, resp) {
			if (err) return util.displayToast(err);
			resp.json().then(function (data) {
				roomView.roomLeaveSuccess(data);
			});
		});
	});

	document.addEventListener('onGetRooms', function (e) {
		roomModel.getRooms(function (err, res) {
			if (err) return util.displayToast(err);
			res.json().then(function (data) {
				roomView.displayRoomListInModal(data.rooms);
			});
		});
	});

	// Game functions
	document.addEventListener('displayGame', function (e) {
		roomView.hide();
		gameView.display();
		gameView.setup(e.detail.socket);
	});

	document.addEventListener('connectSocket', function (e) {
		socket = io.connect();
	});

  document.addEventListener('closeSocket', function(e){
    socket.close();
  });

	document.addEventListener('socketJoinRoom', function (e) {
		var cookieUsername = util.str_obj(document.cookie).username;
		socket.emit('join_room', cookieUsername, e.detail.roomId);
		switch (e.detail.usertype) {
			case 'host':
				// waiting for room to be fulls
				socket.on('full_users', function (data) {
					roomView.roomFullUsersHost();
					document.dispatchEvent(new CustomEvent('displayGame', { detail: { socket: socket } }));
				});
				break;
			default:
				socket.on('full_users', function (data) {
					roomView.roomFullUsersDefault();
					document.dispatchEvent(new CustomEvent('displayGame', { detail: { socket: socket } }));
				});

				socket.on('leave_room', function (data) {
					roomView.roomLeaveSuccess({ host: false });
				});
				break;
		}
	});

}(roomView, roomModel, gameView, gameModel, util));