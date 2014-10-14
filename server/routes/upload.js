'use strict';

var express = require('express');

var blind = require('../../lib/blind').create();

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

  var name = req.files[0].name;
  var data = req.files[0].data;

  if (req.body.uploadType === 'encrypt') {
    try {
      data = blind.encrypt(data, key);
      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '.enc"');
      res.send(data);
    }
    catch (err) {
      res.redirect('/encerror.html');
    }
  }
  else {
    try {
      data = blind.decrypt(data, key);
      var re = /\.enc$/;
      name = re.test(name) ? name.replace(re, '') : name + '.dec';

      res.type('text/plain');
      res.set('Content-Disposition', 'attachment; filename="' + name + '"');
      res.send(data);
    }
    catch (err) {
      res.redirect('/decerror.html');
    }
  }
});

module.exports = router;
