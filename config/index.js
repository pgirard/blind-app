'use strict';

var fs = require('fs');
var path = require('path');

var settings = require('./settings');
var secure = require('./secure');

module.exports = {
  settings: settings,
  
  getSslFile: function (fileName) {
    var file;
    fileName = path.resolve(__dirname, './ssl/' + fileName + '.enc');

    if (fs.existsSync(fileName)) {
      file = fs.readFileSync(fileName, { encoding: 'utf8' });
      file = secure.decrypt(file);
    }

    return file;
  }
};
