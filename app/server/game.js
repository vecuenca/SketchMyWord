module.exports = {
	gameHandler: function(io, roomId, room) {
    var ROUND_TIME = 60000;

		// pick random user to be artist
    var users = Object.keys(room.users);

    room.artist = users[Math.floor(Math.random() * users.length)];
    console.log('USERS ARE...', users);
    console.log('THE ARTIST IS...', room.artist);

		// pick a random word
		var words = ['crab', 'archer', 'house', 'cat', 'lion', 'cigar', 'holding hands'];
		var wordIndex = Math.floor(Math.random() * words.length);
		room.wordToDraw = words[wordIndex];
		words.splice(wordIndex, 1);
    console.log('THE WORD IS...', room.wordToDraw);

    console.log('ROOM state as of new round', room);
    // tell artist they are the artist and their word to draw
    var artistSocketId = room.users[room.artist].socketId;
		io.to(artistSocketId).emit('is_artist', room.wordToDraw);

    // tell all guessers their role and who the artist is
    Object.keys(room.users).forEach(function(username) {
      if (username !== room.artist) {
        io.to(room.users[username].socketId).emit('is_guesser', room.artist);
      }
    });

		// start clock
    // setTimeout(roundOver, ROUND_TIME);
    // function() {
    //   console.log('round over lmao');
    // }
	}
}