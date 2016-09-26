const debug = require('debug')('Morar:app');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/store', require('./routes/store'));
app.use('/retrieve', require('./routes/retrieve'));
app.use('/token', require('./routes/token.js'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.json(err);
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);
});

module.exports = app;
