module.exports = {
	roomHandler: function (io, rooms, gameHandler) {
		io.on('connection', function (socket) {

			// has the client's socket join the requested room
			socket.on('join_room', function (username, room) {
				console.log('cur room state', rooms);
				console.log('user ', username, ' is joining room ', room);

				// setup socket info to be used later
				socket.username = username;
				socket.room = room;

				// store socket id in room 
				rooms[room].users[username].socketId = socket.id;
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
				var line = data.line;
				// add received line to history 
				rooms[socket.room].lineHistory.push(line);
				// send line to all clients in the current room EXCEPT itself
				io.sockets.in(socket.room).emit('draw_line', { line: line });
			});

			socket.on('new_message', function(messageObj) {
				let room = rooms[socket.room];
				room.chatHistory.push(messageObj);

				// TODO: probably not a good idea to handle 
				// game logic here...
				if (room.wordToDraw 
						&& room.wordToDraw === messageObj.message
						&& room.artist != socket.username
						&& !(socket.username in room.correctGuessers)) {
					socket.emit('correct_guess');
					socket.broadcast.to(socket.room).emit('word_guessed');
					room.correctGuessers.push(socket.username);
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