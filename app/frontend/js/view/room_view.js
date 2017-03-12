var roomView = (function (util) {
	"use strict";

	var roomView = {};
	var socket;

	roomView.onload = function() {
		document.getElementById('btn-create-game').onclick = function(e){
			e.preventDefault();
			document.dispatchEvent(new CustomEvent('onCreateRoom'));
		};

		document.getElementById('form-join-game').onsubmit = function(e){
			e.preventDefault();
			var event = new CustomEvent('onRoomJoin', {
				detail: {
					roomId: document.getElementById('room-id-input').value
				}
			});
			document.dispatchEvent(event);
		};
	};


	roomView.display = function() {
		$('#room-area').show();
	};

	roomView.hide = function() {
		$('#room-area').hide();
	};

	roomView.roomCreateSuccess = function(roomId){
		// display room id and hide spinner
		document.getElementById('room-id').innerHTML = roomId;
		$('#room-id-spinner').hide();

		// connect to server and join the room we just created
		socket = io.connect();
		var cookieUsername = util.str_obj(document.cookie).username;
		console.log('emitting', cookieUsername, roomId);
		socket.emit('join_room', cookieUsername, roomId);
		
		// wait for room to be full
		socket.on('full_users', function(data) {
			// close currently open room creation modal
			$('#create-game-modal').modal('close');
			document.dispatchEvent(new CustomEvent('displayGame', {detail: {socket: socket}}));
		});
	};

	roomView.roomJoinSuccess = function(roomId){
		console.log('connecting');
		socket = io.connect();
		var cookieUsername = util.str_obj(document.cookie).username;
		console.log('WAITING FOR THE ROOM TO BE FULL');
		console.log('emitting');
		socket.emit('join_room', cookieUsername, roomId);
		socket.on('full_users', function(data) {
			console.log('TIME TO PLAY GAME');
			$('#join-game-modal').modal('close');
			document.dispatchEvent(new CustomEvent('displayGame', {detail: {socket: socket}}));
		});
		// wait for room to be full
	};

	roomView.displayToast = function (msg) {
		Materialize.toast(msg, 5000);
	};

	return roomView;

}(util));