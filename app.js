var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var studentRegisterRouter = require('./routes/studentRegister');
var studentLoginRouter = require('./routes/studentLogin');
var teacherRegisterRouter = require('./routes/teacherRegister');
var teacherLoginRouter = require('./routes/teacherLogin');
var logoutRouter = require('./routes/logout');
var courseAddRouter = require('./routes/courseAdd');
var courseDropRouter = require('./routes/courseDrop');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true
}));
app.use(cors({
  origin: 'http://localhost:4000',
  credentials: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/studentRegister' , studentRegisterRouter);
app.use('/api/studentLogin' , studentLoginRouter);
app.use('/api/teacherRegister' , teacherRegisterRouter);
app.use('/api/teacherLogin' , teacherLoginRouter);
app.use('/api/logout' , logoutRouter);
app.use('/api/courseAdd' , courseAddRouter);
app.use('/api/courseDrop' , courseDropRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
