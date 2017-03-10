var mysql = require('promise-mysql');
var express = require('express');
var app = express();
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

var line_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history 
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', { line: data.line });
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

var createUser = function (user) {
    return connection.query(
        `INSERT INTO \`sketch-my-word\`.\`users\`
	        (\`username\`, \`password\`) 
            VALUES (?, ?);`, [user.username, user.password]);
};

//AUTHENTICATION

app.post('/api/signin/', function (req, res, next) {
    if (!req.body.username || !req.body.password) return res.status(400).send("Bad Request");
    connection.query(
            `SELECT * FROM \`sketch-my-word\`.\`users\` 
            WHERE \`username\` = ? 
            AND \`password\`= ? `, [req.body.username, req.body.password])
        .then(function (error, results, fields) {
            if (error) return res.status(500).send(error);
            res.json(results);
        })
        .catch(function (error) {
            if (error) return res.status(500).send(error);
        });
});

//CREATE
app.put('/api/users/', function (req, res, next) {
    if (!req.body.username || !req.body.password) return res.status(400).send("Bad Request");
    createUser(req.body)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            if (error) return res.status(500).send(error);
        });
});