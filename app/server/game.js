module.exports = {

  roundTimeOver: function (io, roomId, room) {
    io.in(roomId).emit('round_time_over');
    module.exports.endRound(io, roomId, room);
  },

  onCorrectGuess: function (io, roomId, room, socket) {
    socket.emit('correct_guess');
    socket.broadcast.to(socket.room).emit('word_guessed', socket.username);

    room.correctGuessers.push(socket.username);

    // check if everyone (except the Artist) guessed correctly
    if (room.correctGuessers.length === Object.keys(room.users).length - 1) {
      io.in(roomId).emit('everyone_guessed');
      module.exports.endRound(io, roomId, room);
    }
  },

	setupRound: function (io, roomId, room) {
    var ROUND_TIME = 60000;   
    var users = Object.keys(room.users);
    room.timer = setTimeout(module.exports.roundTimeOver, ROUND_TIME, io, roomId, room);

    // pick a random user
    room.artist = users[Math.floor(Math.random() * users.length)];
    room.roundActive = true;

    console.log('USERS ARE...', users);
    console.log('THE ARTIST IS...', room.artist);

		// pick a random word
		var words = ['crab', 'archer', 'house', 'cat', 'lion', 'cigar', 'holding hands'];
		var wordIndex = Math.floor(Math.random() * words.length);
		room.wordToDraw = words[wordIndex];
    
    console.log('THE WORD IS...', room.wordToDraw);
    console.log('ROOM state as of new round', room);

    // tell artist their role and their word to draw
    var artistSocketId = room.users[room.artist].socketId;
		io.to(artistSocketId).emit('is_artist', room.wordToDraw);

    // tell all guessers their role and who the artist is
    Object.keys(room.users).forEach(function (username) {
      if (username !== room.artist) {
        io.to(room.users[username].socketId).emit('is_guesser', room.artist);
      }
    });
	},

  gameHandler: function (io, roomId, room) {
    room.numRounds = Object.keys(room.users).length;
    module.exports.setupRound(io, roomId, room);
  },

  endRound: function  (io, roomId, room) {
    // cancel timer, if it exists
    if (room.timer) {
      clearTimeout(room.timer);
    }

    room.numRounds -= 1;

    // reset state of room
    room.roundActive      = false;
    room.correctGuessers  = [];
    room.wordToDraw       = null;
    room.timer            = null;
    

    if (room.numRounds > 0) {
      io.in(roomId).emit('next_round_starting_soon');
      setTimeout(module.exports.setupRound, 5000, io, roomId, room);
    } else {
      module.exports.gameOver(io, roomId, room);
    }
  },

  gameOver: function (io, roomId, room) {
    // calculate scores and broadcast them
    io.in(roomId).emit('game_over');

    // send them back to room lobby?
  }
}