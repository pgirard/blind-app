'use strict';

var blind = require('./lib/blind').create();


blind.random(16).then(function (key) {
  console.log('Key: ' + key);

  blind.encrypt('Peter', key)
  .then(function (encrypted) {
    console.log('Encrypted: ' + encrypted);
  })
  .catch(function (error) {
    console.log(error.message);
  });
})
