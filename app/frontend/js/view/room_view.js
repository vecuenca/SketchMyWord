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

		// callback for modal open. fire event to fetch room list
    $('#join-game-modal').modal({ 
      ready: function(modal, trigger) {
        document.dispatchEvent(new CustomEvent('onGetRooms'));
      }
    });

		$('#form-chat').submit(function(e) {
			e.preventDefault();
			var event = new CustomEvent('onMessageSubmit', {
				detail: {
					message: $('#chat-input').val()
				}
			});
		});
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
	};

  roomView.displayRoomListInModal = function(rooms) {
    // clear all rows except header
    $('#room-header').nextAll('li').remove();

    // insert the rooms
    var roomList = $('#room-list');
    rooms.forEach(function(room) {
      var e = document.createElement('li');
      e.id = room.roomId;
      e.className = 'collection-item';
      e.innerHTML = `
        <div>${room.roomId}<a href="#!" class="secondary-content">${room.users}/2</a></div>`;

      // if room is full
      if (room.users >= 2) {
        e.className += ' grey lighten-2';
        e.querySelector('.secondary-content').className += ' red-text';
      // setup onclick to join room
      } else {
        e.onclick = function(e) {
          e.preventDefault();
          var event = new CustomEvent('onRoomJoin', {
            detail: {
              roomId: room.roomId
            }
          });
          document.dispatchEvent(event);
        };
      }     

      roomList.append(e);
    });
  };  

	return roomView;

}(util));