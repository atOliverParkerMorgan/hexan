const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const Console = require("console");
const http = require("http");
const {server} = require("socket.io");


const PORT_HTTP = process.env.PORT || 8000;

const indexRouter = require('./routes/index');
const gameRouter = require('./routes/game');
const usersRouter = require('./routes/users');

const app = express();
app.engine('html', require('ejs').renderFile);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client')));
app.use('/', indexRouter);
app.use('/game', gameRouter);
app.use('/users', usersRouter);

// modules
app.use('/pixi', express.static(__dirname + '/node_modules/pixi.js/dist/browser/'));
app.use('/pixi_extras', express.static(__dirname + '/node_modules/@pixi/graphics-extras/dist/browser/'));
app.use('/pixi_viewport', express.static(__dirname + '/node_modules/pixi-viewport/dist/'));
app.use('/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use('/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

// static files
app.use(express.static('client', {}));

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

console.log("starting metal head")

app.listen(PORT_HTTP);

const main = require('./server/game_logic/Main.js');
//main();

