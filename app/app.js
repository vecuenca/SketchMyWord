var config = require('./config');
var express = require('express');
var mysql = require('promise-mysql');
var app = express();

var api = require('./server/api');
var session = require('express-session');
app.use(session({
    secret:            'big crab',
    resave:            false,
    saveUninitialized: true,
    cookie: 		   { secure: false }
}));

var bodyParser = require('body-parser');
var http = require('http');
var socketIo = require('socket.io');

var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(3000, function(){
    console.log("Server running on localhost:8080");
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(express.static('frontend'));

var connection;
var rooms = {};

// event-handler for new incoming connections
io.on('connection', function (socket) {

  // should be fired when we redirect to index.html
  socket.on('init_user', function(username, room) {
    // verify user actually belongs to this room
    if (!rooms[room].users.contains(username)) {
      return; // broadcast unauthorized message?
    }

    // set socket data to use later
    socket.username = username;
    socket.room = room;

    socket.join(room);

    // send line history so far
    var lineHistory = rooms[room].lineHistory;
    for (var line in lineHistory) {
      socket.broadcast.to(room)
        .emit('draw_line', { line: lineHistory[line] } );  
    }
  });

  // handler for when a client draws a line
  socket.on('draw_line', function (data) {
    var line = data.line;
    // add received line to history 
    rooms[socket.room].lineHistory.push(line);
    // send line to all clients in the current room EXCEPT itself
    socket.broadcast.to(socket.room)
      .emit('draw_line', { line: line });
  });
});

mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'sketch-my-word',
    port: '3306'
}).then(function (conn) {
    connection = conn;
    conn.query(`CREATE TABLE IF NOT EXISTS \`sketch-my-word\`.\`users\`( 
        \`username\` VARCHAR(45) NOT NULL,
        \`password\` VARCHAR(45) NOT NULL,
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
app.get('/', function(req, res, next) {
    if (!req.session.user) return res.redirect('/login.html');
    return next();
});

app.get('/signout/', function (req, res, next) {
  req.session.destroy(function(err) {
    if (err) return res.status(500).end(err);
    return res.redirect('/login.html');
  });
});

app.use(express.static('frontend'));
app.use('/api', api);

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
    res.send();
});
