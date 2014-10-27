'use strict';

var Blind = require('blind');
var settings = require('./settings');

module.exports = new Blind({ encryptKey: settings.encryptKey });
