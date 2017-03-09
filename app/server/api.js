var config = require('../config.js');
var mysql = require('promise-mysql');
var express = require('express');
var app = express.Router();
var bodyParser = require('body-parser');
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
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    connection.query(
        `SELECT * FROM \`sketch-my-word\`.\`users\` 
            WHERE \`username\` = ? 
            AND \`password\`= ? `, [req.body.username, req.body.password])
            .then(function(error, results, fields){
                if (error) return res.status(500).send(error);
                res.json(results);
                return next();
            })
            .catch(function(error){
                if(error) return res.status(500).send(error);
                return next();
            });
});

//CREATE
app.put('/users/', function(req, res, next){
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