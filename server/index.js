// server

'use strict';

var path = require('path');

var express = require('express');
var consolidate = require('consolidate');
var logger = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var upload = require('./middleware/upload');
var blind = require('./middleware/blind');
var routes = require('./routes');

var server = express();

server.engine('hbs', consolidate.handlebars);
server.set('view engine', 'hbs');
server.set('views', path.resolve(__dirname, '../client/views'));

server.use(logger('dev'));
server.use(compress());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cookieParser());
server.use(express.static(path.resolve(__dirname, '../client/static')));
server.use('/bower_components', express.static(path.resolve(__dirname, '../client/bower_components')));
server.use(upload);
server.use(blind);

server.use('/', routes);

module.exports = server;
