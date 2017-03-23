module.exports = {
	roomHandler: function (io, rooms, gameHandler, onCorrectGuess) {
		io.on('connection', function (socket) {

			// has the client's socket join the requested room
			socket.on('join_room', function (username, room) {
				console.log('cur room state', rooms);
				console.log('user ', username, ' is joining room ', room);

				// setup socket info to be used later
				socket.username = username;
				socket.room = room;

				// store socket id in room
				console.log('room state after join', rooms);
				socket.join(room);
				
				// game is ready to start
				if (Object.keys(rooms[room].users).length >= rooms[room].roomSize) {
					console.log('game ', room, ' ready to start. emitting full_users');
					io.sockets.in(socket.room).emit('full_users');
					gameHandler(io, room, rooms[room]);
				}
			});

			// handler for when a client draws a line
			socket.on('draw_line', function (data) {
				// var line = data.line;
				// add received line to history 
				rooms[socket.room].lineHistory.push(data);
				// send line to all clients in the current room EXCEPT itself
				io.sockets.in(socket.room).emit('draw_line', data);

			});

			socket.on('new_message', function(messageObj) {
				var room = rooms[socket.room];
				room.chatHistory.push(messageObj);

				// We don't want to render a correct guess...
				if (room.wordToDraw 
						&& room.wordToDraw === messageObj.message
						&& room.artist != socket.username
						&& !(socket.username in room.correctGuessers)) {
					onCorrectGuess(io, socket.room, room, socket);
				} else {
					io.sockets.in(socket.room).emit('render_message', messageObj);
				}
			});
		});
	},

	stateHandler: function(io, rooms) {
		Object.keys(rooms).forEach(function(key, index) {
			// if host leave or room is empty, remove it from state and close all sockets
			if (rooms[key].host in rooms[key] || Object.keys(rooms[key].users).length == 0){
        io.sockets.in(key).emit('leave_room');
				delete rooms[key];
			}
		});
	}
}