var _ = require('lodash');
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
        socket.join(room);

        // game is ready to start and we are currently not in a game
        if (Object.keys(rooms[room].users).length >= rooms[room].roomSize &&
          !rooms[room].roundActive) {
          console.log('game ', room, ' ready to start. emitting full_users');
          io.sockets.in(socket.room).emit('full_users');
          gameHandler(io, room, rooms[room]);
        }
      });

      // handler for when a client draws a line
      socket.on('draw_line', function (data) {
        if (socket.username !== rooms[socket.room].artist) {
          return;
        }
        // add received line to history 
        rooms[socket.room].lineHistory.push(data);
        // send line to all clients in the current room EXCEPT itself
        io.sockets.in(socket.room).emit('draw_line', data);
      });

      socket.on('new_message', function (messageObj) {
        var room = rooms[socket.room];
        room.chatHistory.push(messageObj);

        // We don't want to render a correct guess...
        if (room.wordToDraw
          && room.wordToDraw === messageObj.message
          && room.artist != socket.username
          && !(socket.username in room.correctGuessers)) {
          onCorrectGuess(io, socket.room, room, socket);
        } else {
          messageObj.color = rooms[socket.room].users[socket.username].color;
          io.sockets.in(socket.room).emit('render_message', messageObj);
        }
      });

      socket.on('disconnect', function (data) {
        console.log('disconnected socket ' + socket.username);

        var sioRoom = io.sockets.adapter.rooms[socket.room];
        var room = rooms[socket.room];

        // if there is no room, that means we are in lobby and deleted the room 
        // as a host
        if (room) {
          //if we're in a lobby, remove the user from the state room
          if (!room.roundActive) {
            delete rooms[socket.room].users[socket.username];

            // if host leave or room is empty, remove it from state and close all sockets
            if (room.host == socket.username || Object.keys(room.users).length == 0) {
              io.sockets.in(socket.room).emit('leave_room');
              delete rooms[socket.room];
              return;
            }
          } else {
            if (!sioRoom) {
              //if the sioroom this socket belongs does not exist, 
              //remove state room since everyone is gone
              delete rooms[socket.room];
            }
          }
        }
      });
    });
  }
}