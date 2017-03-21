module.exports = {
	gameHandler: function(io, roomId, room) {
    var ROUND_TIME = 60000;

		// pick random user to be artist
    var users = Object.keys(room.users);
    var artist = room.users[Math.floor(Math.random * Object.keys(room.users).length)];

		// pick a random word
		var words = ['crab', 'archer', 'house', 'cat', 'lion', 'cigar', 'holding hands'];
		var wordIndex = Math.floor(Math.random * words.length);
		var wordToDraw = words[wordIndex];
		words.splice(wordIndex, 1);

    // emit roles to players
    var artistSocketId = room.users[artist].socketId;
		io.to(artistSocketId).emit('is_artist');

    // tell all guessers their role and who the artist is
    for (let [username, userObj] of Object.entries(room.users)) {  
      if (username === artist) {
        io.to(room.users.username.socketId).emit('is_guesser', artist);
      }
    }

		// start clock
    // setTimeout(roundOver, ROUND_TIME);

    // var roundOver = function() {
    //   // TIMES UP!
    // }

		// listen for guesses
	}
}