// server/routes

'use strict';

var express = require('express');

var api = require('./api');
var upload = require('./upload');

var router = express.Router();

router.use('/api', api);
router.use('/upload', upload);

module.exports = router;
