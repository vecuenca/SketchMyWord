var mysql = require('promise-mysql');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var session = require('express-session');
app.use(session({
    secret:            'big crab',
    resave:            false,
    saveUninitialized: true,
    cookie: 		   { sameSite: true }
}));

var connection;
 
mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'sketch-my-word',
    port: '3306'
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

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

var createUser = function(user){
    return connection.query(
        `INSERT INTO \`sketch-my-word\`.\`users\`
            (\`username\`, \`password\`) 
            VALUES (?, ?);`, [user.username, user.password]);
};

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

//AUTHENTICATION

app.post('/api/signin/', function(req, res, next){
  if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
  connection.query(
      `SELECT * FROM \`sketch-my-word\`.\`users\` 
          WHERE \`username\` = ? 
          AND \`password\`= ? `, [req.body.username, req.body.password])
  .then(function(results, fields){
    console.log('results', results[0].username, 'fields',fields);

    console.log('a');
    if (!results || results[0].password != req.body.password) {
      return res.status(401).send('Sorry, we couldn\'t find your account.');
    }
    console.log('a');
    req.session.user = results[0];
    res.cookie('username', results[0].username, {sameSite: true });
    return res.json({success: true});
  })
  .catch(function(error){
    if(error) return res.status(500).send(error);
  });
});

//CREATE
app.put('/api/users/', function(req, res, next){
    if (!req.body.username || !req.body.password) return res.status(400).send("Bad Request");
    createUser(req.body)
    .then(function(result){
        res.json(result);
    })
    .catch(function(error){
        if(error) return res.status(500).send(error);
    });
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});