'use strict';

var express = require('express');

var blind = require('blind')();
var is = require('is');

var router = express.Router();

router.post('/random', function (req, res) {
  var length = parseFloat(req.body.length);

  if (!is.number(length) || !is.int(length) || !is.within(length, 8, blind.maxRandomLength)) {
    res.status(500).send('Length must be an integer between 8 and ' + blind.maxRandomLength);
  }
  else {
    try {
      res.send({ value: blind.random(length) });
    }
    catch (error) {
      res.status(500).send('Could not generate a random value');
    }
  }
});

router.post('/encrypt', function (req, res) {
  var data = req.body.data;
  var key = req.body.key;

  if (!data) {
    res.status(500).send('Data must be a string of one or more characters');
  }
  else if (!key) {
    res.status(500).send('Key must a string of one or more characters');
  }
  else if (!is[blind.binaryEncoding](key)) {
    res.status(500).send('Key must be a ' + blind.binaryEncoding + ' encoded binary value');
  }
  else {
    try {
      res.send({ value: blind.encrypt(data, key) });
    }
    catch (error) {
      res.status(500).send('Could not encrypt the data');
    }
  }
});

router.post('/decrypt', function (req, res) {
  var encrypted = req.body.encrypted;
  var key = req.body.key;

  if (!encrypted) {
    res.status(500).send('Encrypted must be a string of one or more characters');
  }
  else if (!is[blind.binaryEncoding](encrypted)) {
    res.status(500).send('Encrypted must be a ' + blind.binaryEncoding + ' encoded binary value');
  }
  else if (!key) {
    res.status(500).send('Key must a string of one or more characters');
  }
  else if (!is[blind.binaryEncoding](key)) {
    res.status(500).send('Key must be a ' + blind.binaryEncoding + ' encoded binary value');
  }
  else {
    try {
      res.send({ value: blind.decrypt(encrypted, key) });
    }
    catch (error) {
      res.status(500).send('Could not decrypt the data; may not be encrypted data or a valid key');
    }
  }
});

router.post('/hash', function (req, res) {
  var data = req.body.data;
  var salt = req.body.salt;

  if (!data) {
    res.status(500).send('Data must be a string of one or more characters');
  }
  else if (salt && !is[blind.binaryEncoding](salt)) {
    res.status(500).send('Salt must be a ' + blind.binaryEncoding + ' encoded binary value');
  }
  else {
    blind.hash(data, salt, function (err, value) {
      if (!err) {
        res.send({ value: value });
      }
      else {
        res.status(500).send('Could not hash the data');
      }
    });
  }
});

module.exports = router;
