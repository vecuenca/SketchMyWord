var config = require('./config');
var socketlib = require('./server/socket');
var gamelib = require('./server/game')
var api = require('./server/api');
var state = require('./server/state')
var express = require('express');
var _ = require('lodash');
var mysql = require('promise-mysql');
var app = express();
var session = require('express-session');
app.use(session({
  secret: 'big crab',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

var bodyParser = require('body-parser');
var http = require('http');
var socketIo = require('socket.io');

var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(3000, function () {
  console.log("Server running on localhost:3000");
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

var connection;

var updateUserStats = function(user) {
  let gameWon      = user.gameWon ? 1 : 0;
  let pointsEarned = user.pointsEarned;
  let wordsGuessed = user.wordsGuessed;
  let username     = user.username;

  connection.query(`SELECT high_score
    FROM \`sketch-my-word\`.\`users\` 
    WHERE username = ?;`, [username]).then(res => {
    let oldHighScore = res[0].high_score;
    let newHighScore = pointsEarned > oldHighScore ? pointsEarned : oldHighScore;

    return connection.query(`UPDATE \`sketch-my-word\`.\`users\`
      SET total_games = total_games + 1,
      games_won = games_won + ?,
      total_points = total_points + ?,
      words_guessed = words_guessed + ?,
      high_score = ?
      WHERE username = ?;
    `, [gameWon, pointsEarned, wordsGuessed, newHighScore, username]);
  });

};

socketlib.roomHandler(io, state.rooms, gamelib.gameHandler, 
  gamelib.onCorrectGuess, updateUserStats);

mysql.createConnection({
  host: config.mysql.host,
  user: 'root',
  password: '1234',
  database: 'sketch-my-word',
  port: '3306'
}).then(function (conn) {
  connection = conn;

  conn.query(`CREATE TABLE IF NOT EXISTS \`sketch-my-word\`.\`users\`( 
      \`password\`                  VARCHAR(45) NOT NULL,
      \`username\`                  VARCHAR(45) NOT NULL,
      \`total_games\`               INT default 0,
      \`games_won\`                 INT default 0,
      \`total_points\`              INT default 0,
      \`words_guessed\`             INT default 0,
      \`high_score\`       INT default 0,
          PRIMARY KEY(\`username\`));`)
  .then(function (result, error) {
    if (error) console.log(error);
  });
});

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  return next();
});

// ROUTING
app.get('/', function (req, res, next) {
  if (!req.session.user) return res.redirect('/login.html');
  if (!_.includes(req.url, 'signout')) {
    return res.redirect('/index.html');
  }
  return next();
});

app.get('/signout/', function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) return res.status(500).end(err);
    return res.redirect('/login.html');
  });
});


app.use(express.static('frontend'));
app.use('/api', api);
app.use(function (req, res, next) {
  res.end();
})
