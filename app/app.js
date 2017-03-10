var config = require('./config');
var express = require('express');
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next){
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

app.listen(3000, function () {
  console.log('App listening on port 3000');
});