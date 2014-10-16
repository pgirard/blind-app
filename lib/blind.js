'use strict';

var crypto = require('crypto');
var Promise = require('bluebird');

var is = require('./is');

var validEncryptAlgorithms = crypto.getCiphers();
var validBinaryEncodings = [ 'base64', 'hex' ];

var minRandomLength = 8;
var stringEncoding = 'utf8';
var ciphersMessage = 'see require(\'crypto\').getCiphers() for a list of valid values';

// defaults for property values

var maxRandomLengthDefault = 120;
var maxDataLengthDefault = 4096;
var encryptAlgorithmDefault = 'aes-256-cfb';
var hashRoundsDefault = 10000;
var hashLengthDefault = 60;
var binaryEncodingDefault = 'base64';

// constructor

function Blind(options) {
  options = options || {};

  // set and check maxRandomLength

  this.maxRandomLength = options.maxRandomLength || maxRandomLengthDefault;

  if (!is.number(this.maxRandomLength)) {
    throw new TypeError('Property \'maxRandomLength\' must be a number');
  }

  if (!is.integer(this.maxRandomLength) || !is.inRange(this.maxRandomLength, 1)) {
    throw new RangeError('Property \'maxRandomLength\' must be an integer greater than 0');
  }

  // set and check maxDataLength

  this.maxDataLength = options.maxDataLength || maxDataLengthDefault;

  if (!is.number(this.maxDataLength)) {
    throw new TypeError('Property \'maxDataLength\' must be a number');
  }

  if (!is.integer(this.maxDataLength) || !is.inRange(this.maxDataLength, 1)) {
    throw new RangeError('Property \'maxDataLength\' must be an integer greater than 0');
  }

  // set and check encryptAlgorithm

  this.encryptAlgorithm = options.encryptAlgorithm || encryptAlgorithmDefault;

  if (validEncryptAlgorithms.indexOf(this.encryptAlgorithm) < 0) {
    throw new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage);
  }

  // set and check hashRounds

  this.hashRounds = options.hashRounds || hashRoundsDefault;

  if (!is.number(this.hashRounds)) {
    throw new TypeError('Property \'hashRounds\' must be a number');
  }

  if (!is.integer(this.hashRounds) || !is.inRange(this.hashRounds, 1)) {
    throw new RangeError('Property \'hashRounds\' must be an integer greater than 0');
  }

  // set and check hashLength

  this.hashLength = options.hashLength || hashLengthDefault;

  if (!is.number(this.hashLength)) {
    throw new TypeError('Property \'hashLength\' must be a number');
  }

  if (!is.integer(this.hashLength) || !is.inRange(this.hashLength, 1)) {
    throw new RangeError('Property \'hashLength\' must be an integer greater than 0');
  }

  // set and check binaryEncoding

  this.binaryEncoding = options.binaryEncoding || binaryEncodingDefault;

  if (validBinaryEncodings.indexOf(this.binaryEncoding) < 0) {
    throw new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', '));
  }
}

// methods

Blind.prototype.random = function (length) {
  var self = this;

  return new Promise(function (resolve, reject) {
    if (!is.number(self.maxRandomLength)) {
      reject(new TypeError('Property \'maxRandomLength\' must be a number'));
      return;
    }

    if (!is.integer(self.maxRandomLength) || !is.inRange(self.maxRandomLength, 1)) {
      reject(new RangeError('Property \'maxRandomLength\' must be an integer greater than 0'));
      return;
    }

    if (!is.number(length)) {
      reject(new TypeError('Argument \'length\' must be a number'));
      return;
    }

    if (!is.integer(length) || !is.inRange(length, minRandomLength, self.maxRandomLength)) {
      reject(new RangeError('Argument \'length\' must be an integer between ' + minRandomLength + ' and ' + self.maxRandomLength));
      return;
    }

    // generate the random value

    crypto.randomBytes(length, function (error, buffer) {
      if (!error) {
        resolve(buffer.toString(self.binaryEncoding));
      }
      else {
        reject(error);
      }
    });
  });
};

Blind.prototype.encrypt = function(data, key) {
  var self = this;

  return new Promise(function (resolve, reject) {

    // check properties and arguments

    if (validEncryptAlgorithms.indexOf(self.encryptAlgorithm) < 0) {
      reject(new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage));
      return;
    }

    if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
      reject(new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', ')));
      return;
    }

    if (!is.string(data) || !data.length) {
      reject(new TypeError('Argument \'data\' must be a string with one or more characters'));
      return;
    }

    if (!is.string(key) || !key.length) {
      reject(new TypeError('Argument \'key\' must be a string with one or more characters'));
      return;
    }

    if (!is.encodedBinary(key, self.binaryEncoding)) {
      reject(new TypeError('Argument \'key\' must be a ' + self.binaryEncoding + ' encoded binary value'));
      return;
    }

    try {
      var cipher = crypto.createCipher(self.encryptAlgorithm, key);
      var buffer = new Buffer(0);

      cipher.on('data', function (chunk) {
        buffer = Buffer.concat([ buffer, chunk ]);
      })
      .on('end', function () {
        resolve(buffer.toString(self.binaryEncoding));
      })
      .end(data, stringEncoding);
    }
    catch (error) {
      reject(error);
    }
  });
};

Blind.prototype.decrypt = function(data, key) {
  var self = this;

  return new Promise(function (resolve, reject) {

    // check properties and arguments

    if (validEncryptAlgorithms.indexOf(self.encryptAlgorithm) < 0) {
      reject(new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage));
      return;
    }

    if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
      reject(new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', ')));
      return;
    }

    if (!is.string(data) || !data.length) {
      reject(new TypeError('Argument \'data\' must be a string with one or more characters'));
      return;
    }

    if (!is.encodedBinary(data, self.binaryEncoding)) {
      reject(new TypeError('Argument \'data\' must be a ' + self.binaryEncoding + ' encoded binary value'));
      return;
    }

    if (!is.string(key) || !key.length) {
      reject(new TypeError('Argument \'key\' must be a string with one or more characters'));
      return;
    }

    if (!is.encodedBinary(key, self.binaryEncoding)) {
      reject(new TypeError('Argument \'key\' must be a ' + self.binaryEncoding + ' encoded binary value'));
      return;
    }

    try {
      var decipher = crypto.createDecipher(self.encryptAlgorithm, key);
      var buffer = new Buffer(0);

      decipher.on('data', function (chunk) {
        buffer = Buffer.concat([ buffer, chunk ]);
      })
      .on('end', function () {
        resolve(buffer.toString(stringEncoding));
      })
      .end(data, self.binaryEncoding);
    }
    catch (error) {
      reject(new Error('Could not decrypt data; \'data\' may not be encrypted ' +
        ' or may not have been encrypted with \'key\''));
    }
  });
};

Blind.prototype.hash = function(data, salt) {
  var self = this;

  return new Promise(function (resolve, reject) {

    // check properties and arguments

    if (!is.number(self.hashRounds)) {
      reject(new TypeError('Property \'hashRounds\' must be a number'));
    }

    if (!is.integer(self.hashRounds) || !is.inRange(self.hashRounds, 1)) {
      reject(new RangeError('Property \'hashRounds\' must be an integer greater than 0'));
    }

    if (!is.number(self.hashLength)) {
      reject(new TypeError('Property \'hashLength\' must be a number'));
    }

    if (!is.integer(self.hashLength) || !is.inRange(self.hashLength, 1)) {
      reject(new RangeError('Property \'hashLength\' must be an integer greater than 0'));
    }

    if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
      reject(new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', ')));
    }

    if (!is.string(data) || !data.length) {
      reject(new TypeError('Argument \'data\' must be a string with one or more characters'));
    }

    if (salt) {
      if (!is.string(salt) || !salt.length) {
        reject(new TypeError('Argument \'salt\' must be a string with one or more characters'));
      }

      if (!is.encodedBinary(salt, self.binaryEncoding)) {
        reject(new TypeError('Argument \'salt\' must a ' + self.binaryEncoding + ' encoded binary value'));
        return;
      }
    }

    crypto.pbkdf2(data, salt, self.hashRounds, self.hashLength, function (error, hash) {
      if (!error) {
        resolve(hash.toString(self.binaryEncoding));
      }
      else {
        reject(error);
      }
    });
  });
};

// static methods

Blind.create = function (options) {
  return new Blind(options);
};

module.exports = Blind;
