var roomView = (function (util) {
	"use strict";

	var roomView = {};
	var socket;

	roomView.onload = function() {
		$('#cancel-room-create').click(function(e) {
			if (!$('#room-id').text())	return;
			document.dispatchEvent(new CustomEvent('onLeaveRoom', {
				detail: {
					roomId: document.getElementById('room-id').innerHTML,
				}
			}));
		});

		$('#cancel-room-join').click(function(e) {
			if (!$('#join-waiting-text').is(':visible')) return;
			document.dispatchEvent(new CustomEvent('onLeaveRoom', {
				detail: {
					roomId: $('#join-waiting-text').attr('roomId'),
				}
			}));
		});

		$('#form-create-room').submit(function(e) {
			e.preventDefault();
			var roomSize = $('#room-size').val();
			// create the room
			document.dispatchEvent(new CustomEvent('onCreateRoom', {
				detail: { roomSize: roomSize }
			}));
		});

		$('#form-join-game').submit(function(e){
			e.preventDefault();
			var event = new CustomEvent('onRoomJoin', {
				detail: {
					roomId: document.getElementById('room-id-input').value
				}
			});
			document.dispatchEvent(event);
		});

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
		// display room id, show waiting for users container
		document.getElementById('room-id').innerHTML = roomId;
		$('#modal-users-waiting-container').show();
		$('#form-create-room').hide();

		// connect to server and join the room we just created
		socket = io.connect();
		var cookieUsername = util.str_obj(document.cookie).username;
		socket.emit('join_room', cookieUsername, roomId);
		
		// wait for room to be full
		socket.on('full_users', function(data) {
			$('#room-id-spinner').hide();
			// close currently open room creation modal
			$('#create-game-modal').modal('close');

			// reset modal
			$('#modal-users-waiting-container').hide();
			$('#form-create-room').show();
		
			document.dispatchEvent(new CustomEvent('displayGame', {detail: {socket: socket}}));
		});
	};

	roomView.roomJoinSuccess = function(roomId){
		socket = io.connect();
		var cookieUsername = util.str_obj(document.cookie).username;

		socket.emit('join_room', cookieUsername, roomId);

		//move to controller later
		$('#join-waiting-text').attr('roomId', roomId);

		// waiting for room to be full
		socket.on('full_users', function(data) {
			$('#join-game-modal').modal('close');
			document.dispatchEvent(new CustomEvent('displayGame', {detail: {socket: socket}}));
		});

		socket.on('leave_room', function(data){
			roomView.roomLeaveSuccess({host: false});
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
        <div>${room.roomId}<a href="#!" class="secondary-content">${Object.keys(room.users).length}/${room.roomSize}</a></div>`;

      // if room is full
      if (Object.keys(room.users).length >= room.roomSize) {
        e.className += ' grey lighten-2';
        e.querySelector('.secondary-content').className += ' red-text';
			} else if (util.getUsername() in room.users) {
				e.className += ' grey lighten-2';
      // we can join this room, setup the onclick event
			} else {
        e.onclick = function(e) {
          e.preventDefault();

					// show waiting screen, hide joining
					$('#join-game-container').hide();
					$('#waiting-user-container').show();

          var event = new CustomEvent('onRoomJoin', {
            detail: { roomId: room.roomId }
          });
          document.dispatchEvent(event);
        };
      }     
      roomList.append(e);
    });
  };  

	roomView.roomLeaveSuccess = function(data) {
		//close socket and close the modal
		socket.close();
		if(data.host){
			// we must have left from the create game modal
			$('#create-game-modal').modal('close');
			$('#form-create-room').show();
			$('#modal-users-waiting-container').hide();
		} else {
			// o.w. we tried to join a game
			$('#join-game-modal').modal('close');
			$('#join-game-container').show();
			$('#waiting-user-container').hide();
		}
		
		
	}

	return roomView;
}(util));