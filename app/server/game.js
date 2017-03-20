module.exports = {
	gameHandler: function(io, roomId, room) {
		// pick random user to be artist
		var userArray = room.users.slice();
		var artistIndex = Math.floor(Math.random * userArray.length);
		var artist = userArray[artistIndex];
		userArray.splice(artistIndex, 1);

		// pick a random word
		var words = ['crab', 'archer', 'house', 'cat', 'lion', 'cigar', 'holding hands'];
		var wordIndex = Math.floor(Math.random * words.length);
		var wordToDraw = words[wordIndex];
		words.splice(wordIndex, 1);

		// emit to artist

		// start clock

		// listen for guesses
	}
}