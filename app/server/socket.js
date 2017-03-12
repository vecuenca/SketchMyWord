module.exports = {
    roomHandler: function (io) {

        io.on('connection', function (socket) {
            // should be fired when we redirect to index.html
            socket.on('init_user', function (username, room) {
                // verify user actually belongs to this room
                if (!rooms[room].users.contains(username)) {
                    return; // broadcast unauthorized message?
                }

                // set socket data to use later
                socket.username = username;
                socket.room = room;

                socket.join(room);

                // send line history so far
                var lineHistory = rooms[room].lineHistory;
                for (var line in lineHistory) {
                    socket.broadcast.to(room)
                        .emit('draw_line', { line: lineHistory[line] });
                }
            });

            socket.on('join_room', function () {
                rooms[socket.room].users.push(req.session.user.username);

                if (rooms[socket.room].users.length == 4) {
                    socket.broadcast.to(room).emit('full_users');
                }
            });

            // handler for when a client draws a line
            socket.on('draw_line', function (data) {
                var line = data.line;
                // add received line to history 
                rooms[socket.room].lineHistory.push(line);
                // send line to all clients in the current room EXCEPT itself
                socket.broadcast.to(socket.room)
                    .emit('draw_line', { line: line });
            });
        });

    },

    rooms: {},
}