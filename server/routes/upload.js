'use strict';

var express = require('express');

var blind = require('../../lib/blind').create();
var is = require('../../lib/is');

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

  if (!is.encodedBinary(key, blind.binaryEncoding)) {
    res.redirect('/error.html?e=3');
    return;
  }

  var name = req.files.uploadFile.name;
  var data = req.files.uploadFile.data;

  if (req.body.uploadType === 'encrypt') {
    blind.encrypt(data, key).then(function (value) {
      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '.enc"');
      res.send(value);
    })
    .catch(function (error) {
      res.redirect('/error.html?e=4');
    });
  }
  else {
    var re = /\.enc$/;
    name = re.test(name) ? name.replace(re, '') : name + '.dec';

    blind.decrypt(data, key).then(function (value) {
      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '"');
      res.send(value);
    })
    .catch(function (error) {
      res.redirect('/error.html?e=5');
    });
  }
});

module.exports = router;
