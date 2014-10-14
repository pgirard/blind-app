// reload when a file changes in development

'use strict';

var nodemon = require('nodemon');

nodemon({
  script: 'index.js',
  ext: 'js json'
});

nodemon
  .on('start', function () {
    console.log('app has started');
  })
  .on('quit', function () {
    console.log('app has quit');
  })
  .on('restart', function (files) {
    console.log('app restarted for: ', files);
  });
