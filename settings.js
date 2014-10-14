'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var port = process.env.PORT = process.env.PORT || 80;

module.exports = {
  env: env,
  port: port
};
