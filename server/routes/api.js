'use strict';

var express = require('express');

var blind = require('../../lib/blind').create();

var router = express.Router();

router.post('/random', function (req, res) {
  var length = parseFloat(req.body.length);

  if (!isNumber(length) || !isInteger(length) || !inRange(length, 8, blind.maxRandomLength)) {
    res.status(500).send('Length must be an integer between 8 and ' + blind.maxRandomLength);
  }
  else {
    blind.random(length).then(function (result) {
      res.send({ value: result });
    })
    .catch(function () {
       res.status(500).send('Could not generate a random value');
    });
  }
});

router.post('/encrypt', function (req, res) {
  if (!isString(req.body.data) || !req.body.data.length) {
    res.status(500).send('Data must be a string of one or more characters');
  }
  else if (!isString(req.body.key) || !req.body.key.length) {
    res.status(500).send('Key must a string of one or more characters');
  }
  else {
    try {
      res.send({ value: blind.encrypt(req.body.data, req.body.key) });
    }
    catch (err) {
      res.status(500).send('Could not encrypt the data');
    }
  }
});

router.post('/decrypt', function (req, res) {
  if (!isString(req.body.encrypted) || !req.body.encrypted.length) {
    res.status(500).send('Encrypted must be a string of one or more characters');
  }
  else if (!isString(req.body.key) || !req.body.key.length) {
    res.status(500).send('Key must a string of one or more characters');
  }
  else {
    try {
      res.send({ value: blind.decrypt(req.body.encrypted, req.body.key) });
    }
    catch (err) {
      res.status(500).send('Could not decrypt the data; may not be encrypted data or a valid key');
    }
  }
});

router.post('/hash', function (req, res) {
  if (!isString(req.body.data) || !req.body.data.length) {
    res.status(500).send('Data must be a string of one or more characters');
  }
  else if (req.body.salt && (!isString(req.body.salt) || !req.body.salt.length)) {
    res.status(500).send('Salt must a string of one or more characters');
  }
  else {
    try {
      res.send({ value: blind.hash(req.body.data, req.body.salt) });
    }
    catch (err) {
      res.status(500).send('Could not hash the data');
    }
  }
});

module.exports = router;


function inRange(v, min, max) {
  if (min !== 0 && !min) {
    min = Number.NEGATIVE_INFINITY;
  }

  if (max !== 0 && !max) {
    max = Number.POSITIVE_INFINITY;
  }

  return min <= v && v <= max;
}

function isInteger(v) {
  return Math.floor(v) === v;
}

function isNumber(v) {
  return typeof v === 'number';
}

function isString(v) {
  return typeof v === 'string';
}
