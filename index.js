// application

'use strict';

var https = require('https');

var server = require('./server');
var config = require('./config');
var settings = config.settings;

if (settings.protocol === 'HTTPS') {
  var key = config.getSslFile(settings.env + '-key.pem');
  var cert = config.getSslFile(settings.env + '-cert.pem');
  server = https.createServer({ key: key, cert: cert }, server);
}

server.listen(settings.port, function () {
  console.log('Server listening for %s on port %d (%s).', settings.protocol, settings.port, settings.env);
});
