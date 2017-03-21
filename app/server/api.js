var config = require('../config.js');
var schema = require('./Schemas/signin')
var ZSchema = require("z-schema");
var mysql = require('promise-mysql');
var express = require('express');
var app = express.Router();
var bodyParser = require('body-parser');
var crypto = require('crypto');
var socket = require('./socket');
var state = require('./state.js');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var validator = new ZSchema();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection;
mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port
}).then(function(conn){
    connection = conn;
    conn.query(
    `CREATE TABLE IF NOT EXISTS \`sketch-my-word\`.\`users\`(
        \`username\` VARCHAR(45) NOT NULL,
        \`password\` VARCHAR(45) NOT NULL,
        PRIMARY KEY(\`username\`));`)
        .then(function(result, error){
            if(error) console.log(error);
        });
});

var createUser = function(user){
    return connection.query(
        `INSERT INTO \`sketch-my-word\`.\`users\`
            (\`username\`, \`password\`)
            VALUES (?, ?);`, [user.username, user.password]);
};

//AUTHENTICATION

app.post('/signin/', function(req, res, next){
  validator.validate(req,schema);
  if (!req.body.username || ! req.body.password) {
    return res.status(400).send("Bad Request");
  } 
  connection.query(
    `SELECT * FROM \`sketch-my-word\`.\`users\`
      WHERE \`username\` = ?
      AND \`password\`= ? `, [req.body.username, req.body.password])
  .then(function(results, fields) {
    if (!results || results.length == 0 || results[0].password != req.body.password) {
      return res.status(401).send('Sorry, we couldn\'t find your account.');
    }
    req.session.user = results[0];
    res.cookie('username', results[0].username, { secure: false });
    return res.json({success: true});
  })
  .catch(function(error){
    if(error) return res.status(500).send(error);
  });
});

// -------------------- CREATE -------------------- 
// create a new user
app.put('/users/', function(req, res, next){
    validator.validate(req, schema);
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    createUser(req.body)
    .then(function(result){
        res.json(result);
        return next();
    })
    .catch(function(error){
        if(error) return res.status(500).send(error);
        return next();
    });
});

// create a new room
app.put('/game/', function(req, res, next) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden");
  }

  var roomSize = req.body.roomSize;
  
  var roomId = generateRoomToken();

  // create a new game instance, add it to store
  state.rooms[roomId] = {
    lineHistory: [],
    chatHistory: [],
    users: {},
    host: req.session.user.username,
    roomSize:  roomSize
  };
  state.rooms[roomId].users[req.session.user.username] = {};

  res.json({ roomId: roomId });
  return next();
});

// join an existing room
app.post('/game/:roomId/', function(req, res, next) {
  if (!req.session.user) {
    return res.status(403).send('Forbidden');
  }

  var roomId   = req.params.roomId;
  var room     = state.rooms[roomId];
  var username = req.session.user.username;

  // check if room exists
  if (!room) {
    return res.status(400).send('No room with that id exists.');
  }
  
  // check if room is full
  // currently, max num of players is 4
  if (Object.keys(room.users).length >= room.roomSize) {
    return res.status(400).send('Sorry, that room is full.');
  }

  // check if we are already in this room
  if (username in room.users) {
    return res.status(400).send('You have already joined this room.');
  }
  
  // update room with new user
  room.users.username = {};

  res.json({success: true}); 
  return next();
});

// -------------------- READ --------------------
// get all current games with number of users in them
app.get('/game', function(req, res, next) {
  if (!req.session.user) {
    return res.status(403).send('Forbidden');
  }
  // there's probably a more elegant way to do this..
  var roomsWithUsers = [];
  Object.keys(state.rooms).forEach(function(key,index) {
    roomsWithUsers.push({ roomId: key, 
                          users: state.rooms[key].users,
                          roomSize: state.rooms[key].roomSize }); 
  });
  res.json({ rooms: roomsWithUsers }); 
  return next();
});

var generateRoomToken = function() {
  return crypto.randomBytes(8).toString('hex');
};

// -------------------- DELETE --------------------
app.delete('/game/:roomId/', function(req, res, next){
  if (!req.session.user) {
    return res.status(403).send('Forbidden');
  }
  var roomId = req.params.roomId;
  if (!state.rooms[roomId]) {
    return res.status(400).send('No room with that id exists.');
  }

  //remove the user from the room
  delete state.rooms[req.params.roomId].users[req.session.user.username];
  if (state.rooms[req.params.roomId].host == req.session.user.username){
    res.json({success: true, host: true});
  }else{
    res.json({success: true, host: false});
  }
  
  return next();
});

module.exports = app;
