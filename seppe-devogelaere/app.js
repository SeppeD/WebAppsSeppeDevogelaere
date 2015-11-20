var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport'); 
//var jwt = require('express-jwt'); 

// Mongo db settings 
mongoose.connect('mongodb://localhost/news');
require("./models/Comments");
require("./models/Posts");
require('./models/Users');
require('./config/passport'); 


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup is not needed becasue i am serving via sendFile
// No view engines are being used because it does not have linting 
// support via html lint in vim
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Jwt not cookies needed
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found' + ' it vanished ');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log("gomg omdfomad" );
    res.status(err.status || 500);
    res.render('error', {
      message: err.message + " Great thanks for the 500",
      error: err
    });
  });
}

app.get('*', function(req, res){
      res.send('what???', 404);
});
 
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;