var config = require('./config');
var socketlib = require('./server/socket');
var api = require('./server/api');
var state = require('./server/state')
var express = require('express');
var mysql = require('promise-mysql');
var app = express();
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
    console.log("Server running on localhost:3000");
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var connection;

socketlib.roomHandler(io, state.rooms);

mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
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
app.use(function(req, res, next){
    socketlib.stateHandler(io, state.rooms);
    res.end();
})
