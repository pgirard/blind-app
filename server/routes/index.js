// server/routes

'use strict';

var express = require('express');
var router = express.Router();

router.use('/api', require('./api'));
router.use('/upload', require('./upload'));
router.use('/', require('./root'));

module.exports = router;
