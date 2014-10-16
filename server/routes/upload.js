'use strict';

var express = require('express');

var blind = require('../../lib/blind').create();
var is = require('../../lib/is');

var router = express.Router();

router.post('/', function (req, res) {
  if (!req.files.length) {
    res.status(500).send('No file uploaded');
    return;
  }

  var key = req.body.encryptKey;

  if (!key) {
    res.status(500).send('No encryption key provided');
    return;
  }

  if (!is.encodedBinary(key, blind.binaryEncoding)) {
    res.status(500).send('Encryption key must be a ' + blind.binaryEncoding + ' encoded binary value');
    return;
  }

  var name = req.files[0].name;
  var data = req.files[0].data;

  if (req.body.uploadType === 'encrypt') {
    blind.encrypt(data, key).then(function (value) {
      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '.enc"');
      res.send(value);
    })
    .catch(function (error) {
      res.redirect('/encerror.html');
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
      res.redirect('/decerror.html');
    });
  }
});

module.exports = router;
