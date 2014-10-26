'use strict';

var express = require('express');
var is = require('is');

var router = express.Router();

router.post('/', function (req, res) {
  if (!Object.keys(req.files).length) {
    res.redirect('/error.html?e=1');
    return;
  }

  var key = req.body.encryptKey;

  if (!key) {
    res.redirect('/error.html?e=2');
    return;
  }

  var blind = req.blind;

  if (!is[blind.binaryEncoding](key)) {
    res.redirect('/error.html?e=3');
    return;
  }

  var name = req.files.uploadFile.name;
  var data = req.files.uploadFile.data;
  var value;

  if (req.body.uploadType === 'encrypt') {
    try {
      value = blind.encrypt(data, key);
      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '.enc"');
      res.send(value);
    }
    catch (error) {
      res.redirect('/error.html?e=4');
    }
  }
  else {
    var re = /\.enc$/;
    name = re.test(name) ? name.replace(re, '') : name + '.dec';

    try {
      value = blind.decrypt(data, key);
      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '"');
      res.send(value);
    }
    catch (error) {
      res.redirect('/error.html?e=5');
    }
  }
});

module.exports = router;
