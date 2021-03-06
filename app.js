var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/src/build')));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
}

app.use('/api', require('./routes/timeChart'));
app.use('/api', require('./routes/genresDepartments'));
app.use('/api', require('./routes/budgetRevenue'));

if (process.env.NODE_ENV === 'development') {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}

if (process.env.NODE_ENV === 'production') {
  app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/build/index.html'));
  });
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/build/index.html'));
  });
}

module.exports = app;


if (process.env.NODE_ENV === 'development') {
  const db = require('./config/db');
  db.connectDB();
}
