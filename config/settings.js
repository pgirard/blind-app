'use strict';

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  protocol: process.env.PROTOCOL || 'HTTP',
  encryptKey: process.env.ENCRYPT_KEY || 'not_set'
};
