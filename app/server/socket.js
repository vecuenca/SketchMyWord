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
				console.log('room size', rooms[room].users.length);
				if (rooms[room].users.length >= 2) {
					console.log('emitting full_users');
					io.sockets.in(socket.room).emit('full_users');
				}
			});

			// handler for when a client draws a line
			socket.on('draw_line', function (data) {
				var line = data.line;
				// add received line to history 
				rooms[socket.room].lineHistory.push(line);
				// send line to all clients in the current room EXCEPT itself
				io.sockets.in(socket.room).emit('draw_line', { line: line });
				// socket.to(socket.room)
				// 	.emit('draw_line', { line: line });
			});
		});
	},
}