// application

'use strict';

var server = require('./server');
var settings = require('./settings');

server.listen(settings.port, function () {
  console.log('Server listening for HTTP on port %d (%s).', settings.port, settings.env);
});
