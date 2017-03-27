var config           = require('../config.js');
var mysql            = require('promise-mysql');
var express          = require('express');
var app              = express.Router();
var bodyParser       = require('body-parser');
var crypto           = require('crypto');
var socket           = require('./socket');
var state            = require('./state.js');
var Sentencer        = require('sentencer');
var cookieParser     = require('cookie-parser');

var expressValidator = require('express-validator');
var util             = require('util');
var _                = require('lodash');
app.use(expressValidator({
  customValidators: {
    fail: function(value){
      return false;
    }
  }
})); 
app.use(function(req, res, next) {
	Object.keys(req.body).forEach(function(arg) {
			switch(arg) {
				case 'username':
					req.checkBody(arg, 'Invalid username').notEmpty().isAlphanumeric();
					break;
				case 'password':
					req.checkBody(arg, 'Invalid password').notEmpty();
					break;
				case 'roomSize':
					req.checkBody(arg, 'Invalid title').notEmpty().isNumeric();
					break;
				default:
					req.checkBody(arg, 'unknown argument').fail();
			}
	});
	req.getValidationResult().then(function(result) {
		if (!result.isEmpty()) {
      console.log(util.inspect(result.array()));
      return res.status(400).json('Validation errors: ' + util.inspect(result.array()));
    } else {
      next();
    } 
	});
});

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection;
mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
    multipleStatements: true
}).then(function(conn){
    connection = conn;
    conn.query(`CREATE TABLE IF NOT EXISTS \`sketch-my-word\`.\`users\`(
        \`username\` VARCHAR(45) NOT NULL,
        \`salt\` VARCHAR(255) NOT NULL,
        \`salted_hash\` VARCHAR(255) NOT NULL,
        \`total_games\`               INT default 0,
        \`games_won\`                 INT default 0,
        \`total_points\`              INT default 0,
        \`words_guessed\`             INT default 0,
        \`high_score\`       INT default 0,
        PRIMARY KEY(\`username\`));`)
        .then(function(result, error){
            if(error) console.log(error);
        });
});

// sql queries

var createUser = function (user) {
  return connection.query(
    `INSERT INTO \`sketch-my-word\`.\`users\`
      (username, salt, salted_hash)
      VALUES (?, ?, ?);`, [user.username, user.salt, user.saltedHash]);
};


var fetchUserStats = function(username) {
  return connection.query(`SELECT total_games, 
    games_won, total_points, words_guessed,
    high_score
    FROM \`sketch-my-word\`.\`users\` 
    WHERE username = ?;
  `, [username]);
};

var fetchGlobalStats = (sortParam, limitTo) => {
  return connection.query(`SELECT username, total_games,
    games_won, total_points, words_guessed,
    high_score
    FROM \`sketch-my-word\`.\`users\` 
    ORDER BY ? DESC 
    LIMIT ?; 
  `, [sortParam, parseInt(limitTo)]);
};


// i dunno whre to put this LOL
var getRandomColor = function () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

//AUTHENTICATION
var User = function (user) {
  var salt = crypto.randomBytes(16).toString('base64');
  var hash = crypto.createHmac('sha512', salt);
  hash.update(user.password);
  this.username = user.username;
  this.salt = salt;
  this.saltedHash = hash.digest('base64');
};

var verifyPassword = (user, password) => {
  var hash = crypto.createHmac('sha512', user.salt);
  hash.update(password);
  var value = hash.digest('base64');
  return user.salted_hash === value;
};

app.post('/signin/', function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json("Bad Request");
  }
  if (_.includes(req.body.username, " ")) return res.status(400).json("no spaces in username allowed");
  if (_.includes(req.body.password, " ")) return res.status(400).json("no spaces in password allowed");
  connection.query(`SELECT * FROM \`sketch-my-word\`.\`users\`
    WHERE \`username\` = ?;`, [req.body.username])
    .then((results, fields) => {
      if (!results || results.length == 0) {
        return res.status(401).json('Sorry, we couldn\'t find your account.');
      }

      let user = results[0];
      if (!verifyPassword(user, req.body.password)) {
        return res.status(401).json('Unauthorized');  
      }

      req.session.user = user;
      res.cookie('username', user.username, {secure: false, sameSite: true});
      return res.json({ success: true });
    })
    .catch(function (error) {
      if (error) return res.status(500).json(error);
    });
});

// -------------------- CREATE -------------------- 
// create a new user
app.put('/users/', function (req, res, next) {
  if (!req.body.username || !req.body.password) return res.status(400).send("Bad Request");
  if (_.includes(req.body.username, " ")) return res.status(400).json("no spaces in username allowed");
  if (_.includes(req.body.password, " ")) return res.status(400).json("no spaces in password allowed");
  var data = new User(req.body);

  connection.query(`SELECT * FROM \`sketch-my-word\`.\`users\` 
                    WHERE username=?`, [data.username])
    .then(result => {
      if (result.length == 1) return res.status(400).json('username already exists');
      createUser(data)
        .then(result => {
          res.json(result);
          return next();
        })
    }).catch(err => {
      if (err) return res.status(500).json(err);
      return next();
    });
});

// create a new room
app.put('/game/', function (req, res, next) {
  if (!req.session.user) {
    return res.status(403).json("Forbidden");
  }

  var roomSize = req.body.roomSize;
  var roomId = generateRoomToken();
  var username = req.session.user.username;

  // create a new game instance, add it to store
  state.rooms[roomId] = {
    lineHistory: [],
    chatHistory: [],
    correctGuessers: [],
    artistsToChoose: [],
    users: {},
    host: username,
    roomSize: roomSize,
    roundActive: false,

    // these props will be set later
    wordToDraw: null,
    timer: null,
    artist: null,
    usedWords: []
  };
  state.rooms[roomId].users[username] = { score: 0, wordsGuessed: 0, color: getRandomColor() };
  res.cookie('roomId', roomId, {secure: false, sameSite: true});
  res.json({ roomId: roomId });
  return next();
});

// join an existing room
app.post('/game/:roomId/', function (req, res, next) {
  if (!req.session.user) {
    return res.status(403).json('Forbidden');
  }

  var roomId = req.params.roomId;
  var room = state.rooms[roomId];
  var username = req.session.user.username;

  // check if room exists
  if (!room) {
    return res.status(400).json('No room with that id exists.');
  }

  // check if room is full
  // currently, max num of players is 4
  if (Object.keys(room.users).length >= room.roomSize) {
    return res.status(400).json('Sorry, that room is full.');
  }

  // check if we are already in this room
  if (username in room.users) {
    return res.status(400).json('You have already joined this room.');
  }

  // update room with new user
  room.users[username] = { score: 0, wordsGuessed: 0, color: getRandomColor() };

  //set a cookie for the roomId
  res.cookie('roomId', roomId, {secure: false, sameSite: true});
  res.json({ success: true });
  return next();
});

// -------------------- READ --------------------
// get all current games with number of users in them
app.get('/game', function (req, res, next) {
  if (!req.session.user) {
    return res.status(403).json('Forbidden');
  }
  // there's probably a more elegant way to do this..
  var roomsWithUsers = [];
  Object.keys(state.rooms).forEach(function (key, index) {
    roomsWithUsers.push({
      roomId: key,
      users: state.rooms[key].users,
      roomSize: state.rooms[key].roomSize
    });
  });
  res.json({ rooms: roomsWithUsers });
  return next();
});

app.get('/stats/', (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json('Forbidden');
  }

  // default: sort by games_won; limit to 10 players
  var sortParam = req.query.sort ? req.query.sort : 'games_won';
  var limitTo = req.query.limit && req.query.limit > 0 &&
    req.query.limit < 11 ? req.query.limit : 10;

  fetchGlobalStats(sortParam, limitTo).then(result => {
    // THIS MYSQL LIBRARY'S ORDER BY DOES NOT WORK!!!!!!!
    result.sort((a, b) => {
      return b[sortParam] - a[sortParam];
    });
    result = result.sort(0, limitTo);
    res.json(result);
    return next();   
  }).catch(err => {
    console.log(err);
    if (err) {
      res.status(500).json(err);
    }
    return next();
  });
});


app.get('/stats/:username/', function(req, res, next) {
  if (!req.session.user) {
    return res.status(403).json('Forbidden');
  }

  var username = req.params.username;
  fetchUserStats(username).then(result => {
    res.json(result);
    return next();
  })
  .catch(err => {
    if (err) {
      res.status(500).json(err);
    } 
    return next();
  });
});

//get the current status of the game
app.get('/game/:roomId/', function (req, res, next) {
  if (!req.session.user) return res.status(403).json('Forbidden');
  var room = state.rooms[req.params.roomId];
  if (!room) {
    return res.json({ active: false });
  }
  var wordToDraw;

  var currentScore = [];
  if (room.roundActive) {
    Object.keys(room.users).forEach(function(user) {
      var userObj = {};
      userObj.username = user;
      userObj.color = room.users[user].color;
      userObj.score = room.users[user].score;
      currentScore.push(userObj);
    });
    currentScore.sort(function(a, b) { return b.score - a.score});
    if (room.artist == req.session.user.username) {
      wordToDraw = room.wordToDraw
    } else {
      wordToDraw = "";
      for (var i = 0; i < room.wordToDraw.length; i++) {
        wordToDraw = wordToDraw.concat("_ ");
      }
    }
  }

  res.json({
    active: room.roundActive,
    roundStartTime: room.roundStartTime,
    chatHistory: room.chatHistory,
    lineHistory: room.lineHistory,
    wordToDraw: wordToDraw,
    scores: currentScore,
    isArtist: room.artist == req.session.user.username,
  });
  return next();
});

var generateRoomToken = () => {
  let adj1 = capitalize(Sentencer.make('{{adjective}}'));
  let adj2 = capitalize(Sentencer.make('{{adjective}}'));
  let noun = capitalize(Sentencer.make('{{noun}}'));
  return adj1 + adj2 + noun;
};

var capitalize = (le) => {
  return le.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

// -------------------- DELETE --------------------
app.delete('/game/:roomId/', function (req, res, next) {
  if (!req.session.user) {
    return res.status(403).json('Forbidden');
  }
  var roomId = req.params.roomId;
  if (!state.rooms[roomId]) {
    return res.status(400).json('No room with that id exists.');
  }

  //remove the user from the room
  delete state.rooms[req.params.roomId].users[req.session.user.username];
  if (state.rooms[req.params.roomId].host == req.session.user.username) {
    res.json({ success: true, host: true });
  } else {
    res.json({ success: true, host: false });
  }

  return next();
});

module.exports = app;
