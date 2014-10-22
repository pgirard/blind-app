// server

'use strict';

var path = require('path');

var express = require('express');
var logger = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');

var upload = require('./middleware/upload');
var routes = require('./routes');

var server = express();

server.use(logger('dev'));
server.use(compress());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static(path.resolve(__dirname, '../client/static')));
server.use('/bower_components', express.static(path.resolve(__dirname, '../client/bower_components')));
server.use(upload);

server.use('/', routes);

module.exports = server;
