module.exports = {
  gameHandler: function (io, roomId, room) {
    // zero indexed because we're going to use this to iterate through
    // the users array...
    room.userArray = Object.keys(room.users);
    room.numRounds = (room.userArray.length * 2) - 1;
    module.exports.setupRound(io, roomId, room);
  },

  roundTimeOver: function (io, roomId, room) {
    io.in(roomId).emit('round_time_over');
    module.exports.endRound(io, roomId, room);
  },

  onCorrectGuess: function (io, roomId, room, socket) {
    socket.emit('correct_guess');
    socket.broadcast.to(socket.room).emit('word_guessed', socket.username);

    room.correctGuessers.push(socket.username);

    // this player earns 3 points for guessing first
    // otherwise they get one.
    let pointsEarned = room.correctGuessers.length === 1 ? 3 : 1;
    room.users[socket.username].score += pointsEarned;

    // check if everyone (except the Artist) guessed correctly
    // the artist earns 2 points if this happens
    if (room.correctGuessers.length === Object.keys(room.users).length - 1) {
      io.in(roomId).emit('everyone_guessed');
      room.users[room.artist].score += 2;
      module.exports.endRound(io, roomId, room);
    }
  },

	setupRound: function (io, roomId, room) {
    var ROUND_TIME = 60000;
    room.timer = setTimeout(module.exports.roundTimeOver, ROUND_TIME, io, roomId, room);

    // pick a user
    if (room.numRounds >= room.userArray.length) {
      room.artist = room.userArray[room.numRounds - room.userArray.length];
    } else {
      room.artist = room.userArray[room.numRounds];
    }

    room.roundActive = true;

    console.log('USERS ARE...', room.userArray);
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


  endRound: function  (io, roomId, room) {
    if (room.timer) {
      clearTimeout(room.timer);
    }

    // create a sorted score array; emit to user
    var currentScore = [];
    Object.keys(room.users).forEach(function(user) {
      var userObj = {};
      userObj.username = user;
      userObj.score = room.users[user].score;
      currentScore.push(userObj);
    });
    currentScore.sort(function(a, b) { return b.score - a.score});
    console.log('current score is: ',currentScore);
    io.in(roomId).emit('round_over', currentScore);

    room.numRounds -= 1;

    // reset round state of room
    room.roundActive      = false;
    room.correctGuessers  = [];
    room.lineHistory      = []; 
    room.wordToDraw       = null;
    room.timer            = null;
    
    if (room.numRounds > -1) {
      io.in(roomId).emit('next_round_starting_soon');
      setTimeout(module.exports.setupRound, 10000, io, roomId, room);
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