'use strict';

var Busboy = require('busboy');

module.exports = function (req, res, next) {
  if (!req.headers['content-type'] || req.headers['content-type'].indexOf('multipart/form-data') < 0 ||
      !(req.method === 'POST' || req.method === 'PUT')) {
    return next();
  }

  req.files = [];
  req.body = req.body || {};

  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function (field, stream, name, encoding, mimeType) {
    var data = '';

    stream.on('data', function (chunk) {
      data += chunk;
    });

    stream.on('end', function () {
      req.files.push({
        field: field,
        name: name,
        data: data,
        mimeType: mimeType
      });
    });
  });

  busboy.on('field', function(field, value, fieldTruncated, valueTruncated) {
    req.body[field] = value;
  });

  busboy.on('finish', function() {
    next();
  });

  busboy.on('error', function(err) {
    next();
  });

  req.pipe(busboy);
};
