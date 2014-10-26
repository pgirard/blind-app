'use strict';

var crypto = require('crypto');
var express = require('express');

var router = express.Router();

var encodings = [ 'base64', 'hex' ];
var ciphers = crypto.getCiphers();
var hashes = crypto.getHashes();

router.get('/', function (req, res) {
  var blind = req.blind;

  res.render('index', {
    binaryEncodings: encodings.map(function (n) { return { name: n, selected: n === blind.binaryEncoding }; }),
    encryptAlgorithms: ciphers.map(function (n) { return { name: n, selected: n === blind.encryptAlgorithm }; }),
    hashAlgorithms: hashes.map(function (n) { return { name: n, selected: n === blind.hashAlgorithm }; }),
    blind: blind
  });
});

module.exports = router;
