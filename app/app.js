var config = require('./config');
var mysql = require('promise-mysql');
var express = require('express');
var app = express();
var api = require('./server/api');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

app.use('/public', express.static('frontend'));
app.use('/api', api);


app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});