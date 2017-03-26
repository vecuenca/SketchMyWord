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
server.listen(80, function () {
  console.log("Server running on localhost:3000");
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

socketlib.roomHandler(io, state.rooms, gamelib.gameHandler, gamelib.onCorrectGuess);

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
