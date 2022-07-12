const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const PORT_HTTP = process.env.PORT || 8000;

const indexRouter = require('./routes/index');
const {ServerSocket} = require("./server/ServerSocket");

const app = express();
app.engine('html', require('ejs').renderFile);

// create database
const mysql = require('mysql');

// let database_connection = mysql.createConnection({
//   host: "localhost",
//   user: "hexan",
//   password: "1234"
// });
//
// database_connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   database_connection.query("CREATE DATABASE mydb", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client')));

// add sever socket request and response listeners
ServerSocket.add_request_listener();
ServerSocket.add_response_listener();

app.use('/', indexRouter);

// modules
app.use('/pixi', express.static(__dirname + '/node_modules/pixi.js/dist/browser/'));
app.use('/pixi_extras', express.static(__dirname + '/node_modules/@pixi/graphics-extras/dist/browser/'));
app.use('/pixi_viewport', express.static(__dirname + '/node_modules/pixi-viewport/dist/'));
app.use('/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

// html files
app.use('/views', express.static('views', {}));

// static client files
app.use(express.static('client', {}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});
console.log("starting hexan")

app.listen(PORT_HTTP);