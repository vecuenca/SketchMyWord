var roomView = (function () {
	"use strict";

	var roomView = {};
	var socket;

	roomView.onload = function() {
		document.getElementById('btn-create-game').onclick = function(e){
			var event = new CustomEvent('onCreateRoom', {
				detail: {}
			});
			document.dispatchEvent(event);
		};

		document.getElementById('form-join-game').onsubmit = function(e){
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
		socket = io.connect();
		socket.on('full_users', function(data){
			window.location = '/index.html';
		});
		document.getElementById('room-id').value = roomId;
	};

	roomView.roomJoinSuccess = function(){
		//eventually change this to waiting screen
		socket = io.connect();
		socket.emit('join_room');
		// window.location = '/index.html';
	};

	roomView.displayToast = function (msg) {
		Materialize.toast(msg, 5000);
	};

	return roomView;

}());