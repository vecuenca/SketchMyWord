module.exports = {

  getNextWord: function(wordBank, usedWords) {
    var index = Math.floor(Math.random() * wordBank.length);
    while (usedWords.includes(wordBank[index])){
      index = Math.floor(Math.random() * wordBank.length);
    }
    usedWords.push(wordBank[index]);
    return wordBank[index];
  },

  WORD_BANK: ['crab', 'archer', 'house', 'cat', 
      'lion', 'cigar', 'holding hands', 'tennis racket',
      'dragon', 'finger', 'zebra', 'crying', 'stomach'],
  

  gameHandler: function (io, roomId, room, updateUserStats) {
    // zero indexed because we're going to use this to iterate through
    // the users array...
    room.userArray = Object.keys(room.users);
    room.numRounds = (room.userArray.length * 2) - 1;
    io.in(roomId).emit('broadcast_score', module.exports.getScores(io, roomId, room));
    module.exports.setupRound(io, roomId, room, updateUserStats);
  },

  roundTimeOver: function (io, roomId, room, updateUserStats) {
    io.in(roomId).emit('round_time_over');
    module.exports.endRound(io, roomId, room, updateUserStats);
  },

  onCorrectGuess: function (io, roomId, room, socket, updateUserStats) {
    room.correctGuessers.push(socket.username);

    // this player earns 3 points for guessing first
    // otherwise they get one.
    let pointsEarned = room.correctGuessers.length === 1 ? 3 : 1;

    room.users[socket.username].score += pointsEarned;
    room.users[socket.username].wordsGuessed += 1;

    socket.emit('correct_guess', {
      pointsEarned: pointsEarned,
      word: room.wordToDraw
    });
    socket.broadcast.to(socket.room).emit('word_guessed', socket.username);

    // check if everyone (except the Artist) guessed correctly
    // the artist earns 2 points if this happens
    if (room.correctGuessers.length === Object.keys(room.users).length - 1) {
      io.in(roomId).emit('everyone_guessed', room.artist);
      room.users[room.artist].score += 2;
      module.exports.endRound(io, roomId, room, updateUserStats);
    }
  },

	setupRound: function (io, roomId, room, updateUserStats) {

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
		room.wordToDraw = module.exports.getNextWord(module.exports.WORD_BANK, room.usedWords);;
    
    console.log('THE WORD IS...', room.wordToDraw);
    console.log('ROOM state as of new round', room);

    // tell all players their roles
    var sioRoom = io.sockets.adapter.rooms[roomId];
    Object.keys(sioRoom.sockets).forEach(function (socketId){
      var socket = io.sockets.connected[socketId];
      if (socket.username === room.artist) {
        io.to(socketId).emit('is_artist', room.wordToDraw);     
      } else {
        var wordToShow = "";
        for (var i = 0; i < room.wordToDraw.length; i ++) {
          if (room.wordToDraw[i] === " ") {
            wordToShow = wordToShow.concat("  ");
          } else {
            wordToShow = wordToShow.concat("_ ");
          }
        }
        io.to(socketId).emit('is_guesser', {artist: room.artist, wordToShow: wordToShow});
      }
    });

    var ROUND_TIME = 60000;
    room.roundStartTime = new Date();
    room.timer = setTimeout(module.exports.roundTimeOver, ROUND_TIME, io, roomId, room); 
	},

  getScores: function (io, roomId, room) {
    var currentScore = [];
    Object.keys(room.users).forEach(function(user) {
      var userObj = {};
      userObj.username = user;
      userObj.color = room.users[user].color;
      userObj.score = room.users[user].score;
      userObj.wordsGuessed = room.users[user].wordsGuessed;
      currentScore.push(userObj);
    });
    currentScore.sort(function(a, b) { return b.score - a.score});
    return currentScore;
  },

  endRound: function (io, roomId, room, updateUserStats) {
    if (room.timer) {
      clearTimeout(room.timer);
    }

    io.in(roomId).emit('broadcast_score', module.exports.getScores(io, roomId, room));
    io.in(roomId).emit('round_over');
    room.numRounds -= 1;

    // reset round state of room
    room.correctGuessers  = [];
    room.lineHistory      = []; 
    room.chatHistory      = [];
    room.wordToDraw       = null;
    room.timer            = null;
    
    if (room.numRounds > -1) {
      io.in(roomId).emit('next_round_starting_soon');
      setTimeout(module.exports.setupRound, 10000, io, roomId, room, updateUserStats);
    } else {
      module.exports.gameOver(io, roomId, room, updateUserStats);
    }
  },

  gameOver: function (io, roomId, room, updateUserStats) {
    var scores = module.exports.getScores(io, roomId, room);

    // broadcast scores and update the scores db
    io.in(roomId).emit('game_over', scores[0]);

    for (var i = 0; i < scores.length; i++) {
      var userScoreObj = {};
      userScoreObj.gameWon      = i === 0; 
      userScoreObj.pointsEarned = scores[i].score;
      userScoreObj.wordsGuessed = scores[i].wordsGuessed;
      userScoreObj.username     = scores[i].username;
      updateUserStats(userScoreObj);
    }

    // kill room
  }
}