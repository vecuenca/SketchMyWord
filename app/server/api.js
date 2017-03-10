var config = require('../config.js');
var schema = require('./Schemas/signin')
var ZSchema = require("z-schema");
var mysql = require('promise-mysql');
var express = require('express');
var app = express.Router();
var bodyParser = require('body-parser');

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
  if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
  connection.query(
      `SELECT * FROM \`sketch-my-word\`.\`users\` 
          WHERE \`username\` = ? 
          AND \`password\`= ? `, [req.body.username, req.body.password])
  .then(function(results, fields){
    if (!results || results[0].password != req.body.password) {
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

//CREATE
app.put('/users/', function(req, res, next){
    validator.validate(req,schema);
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

module.exports = app;