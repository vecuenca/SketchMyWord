module.exports = {
	roomHandler: function (io, rooms) {
		io.on('connection', function (socket) {
			// has the client's socket join the requested room
			socket.on('join_room', function (username, room) {
				console.log('cur room state', rooms);
				console.log('join room', username, room);
				socket.username = username;
				socket.room = room;

				socket.join(room);

				// READY TO START GAME
				console.log('room size', rooms[room].roomSize);
				console.log('room length', rooms[room].users.length);
				if (rooms[room].users.length >= rooms[room].roomSize) {
					console.log('emitting full_users');
					io.sockets.in(socket.room).emit('full_users');
					gameHandler(io, room, rooms[room]);
				}
			});

			// handler for when a client draws a line
			socket.on('draw_line', function (data) {
				var line = data.line;
				// add received line to history 
				rooms[socket.room].lineHistory.push(line);
				//   send line to all clients in the current room EXCEPT itself
				io.sockets.in(socket.room).emit('draw_line', { line: line });
			});

			socket.on('new_message', function(messageObj) {
				rooms[socket.room].chatHistory.push(messageObj);
				io.sockets.in(socket.room).emit('render_message', messageObj);
			});
		});
	},

	stateHandler: function(io, rooms) {
		Object.keys(rooms).forEach(function(key, index) {
			// if host leave or room is empty, remove it from state and close all sockets
			if (rooms[key].users.indexOf(rooms[key].host) == -1 || rooms[key].users.length == 0){
        io.sockets.in(key).emit('leave_room');
				delete rooms[key];
			}
		});
	}
}