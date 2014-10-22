'use strict';

var crypto = require('crypto');
var Promise = require('bluebird');

var is = require('./is');

// constants

var minRandomLength = 8;
var stringEncoding = 'utf8';

// lists

var validEncryptAlgorithms = crypto.getCiphers();
var validBinaryEncodings = [ 'base64', 'hex' ];

// defaults for property values

var binaryEncodingDefault = 'base64';
var encryptAlgorithmDefault = 'aes-256-cbc';
var hashLengthDefault = 60;
var hashRoundsDefault = 10000;
var maxDataLengthDefault = 4096;
var maxRandomLengthDefault = 120;
var skipChecksDefault = false;

// property error messages

var binaryEncodingMessage = 'Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', ');
var encryptAlgorithmMessage = 'Property \'encryptAlgorithm\' invalid; see require(\'crypto\').getCiphers() for a list of valid values';
var hashLengthMessage = 'Property \'hashRounds\' must be a number';
var hashLengthRangeMessage = 'Property \'hashRounds\' must be an integer greater than 0';
var hashRoundsMessage = 'Property \'hashRounds\' must be a number';
var hashRoundsRangeMessage = 'Property \'hashRounds\' must be an integer greater than 0';
var maxDataLengthMessage = 'Property \'maxDataLength\' must be a number';
var maxDataLengthRangeMessage = 'Property \'maxDataLength\' must be an integer greater than 0';
var maxRandomLengthMessage = 'Property \'maxRandomLength\' must be a number';
var maxRandomLengthRangeMessage = 'Property \'maxRandomLength\' must be an integer greater than ' + minRandomLength;

// constructor

function Blind(options) {
  options = options || {};

  // set and check binaryEncoding

  this.binaryEncoding = options.binaryEncoding || binaryEncodingDefault;

  if (validBinaryEncodings.indexOf(this.binaryEncoding) < 0) {
    throw new RangeError(binaryEncodingMessage);
  }

  // set and check encryptAlgorithm

  this.encryptAlgorithm = options.encryptAlgorithm || encryptAlgorithmDefault;

  if (validEncryptAlgorithms.indexOf(this.encryptAlgorithm) < 0) {
    throw new RangeError(encryptAlgorithmMessage);
  }

  // set and check hashLength

  this.hashLength = options.hashLength || hashLengthDefault;

  if (!is.number(this.hashLength)) {
    throw new TypeError(hashLengthMessage);
  }

  if (!is.integer(this.hashLength) || !is.inRange(this.hashLength, 1)) {
    throw new RangeError(hashLengthRangeMessage);
  }

  // set and check hashRounds

  this.hashRounds = options.hashRounds || hashRoundsDefault;

  if (!is.number(this.hashRounds)) {
    throw new TypeError(hashRoundsMessage);
  }

  if (!is.integer(this.hashRounds) || !is.inRange(this.hashRounds, 1)) {
    throw new RangeError(hashRoundsRangeMessage);
  }

  // set and check maxDataLength

  this.maxDataLength = options.maxDataLength || maxDataLengthDefault;

  if (!is.number(this.maxDataLength)) {
    throw new TypeError(maxDataLengthMessage);
  }

  if (!is.integer(this.maxDataLength) || !is.inRange(this.maxDataLength, 1)) {
    throw new RangeError(maxDataLengthRangeMessage);
  }

  // set and check maxRandomLength

  this.maxRandomLength = options.maxRandomLength || maxRandomLengthDefault;

  if (!is.number(this.maxRandomLength)) {
    throw new TypeError(maxRandomLengthMessage);
  }

  if (!is.integer(this.maxRandomLength) || !is.inRange(this.maxRandomLength, minRandomLength + 1)) {
    throw new RangeError(maxRandomLengthRangeMessage);
  }

  // set skipChecks

  this.skipChecks = options.skipChecks || skipChecksDefault;
}

// methods

Blind.prototype.random = function (length) {
  var self = this;

  return new Promise(function (resolve, reject) {

    // check properties and arguments

    if (!self.skipChecks) {
      if (!is.number(self.maxRandomLength)) {
        reject(new TypeError(maxRandomLengthMessage));
        return;
      }

      if (!is.integer(self.maxRandomLength) || !is.inRange(self.maxRandomLength, minRandomLength + 1)) {
        reject(new RangeError(maxRandomLengthRangeMessage));
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

    if (!self.skipChecks) {
      if (!is.number(self.maxDataLength)) {
        reject(new TypeError(maxDataLengthMessage));
      }

      if (!is.integer(self.maxDataLength) || !is.inRange(self.maxDataLength, 1)) {
        reject(new RangeError(maxDataLengthRangeMessage));
      }

      if (validEncryptAlgorithms.indexOf(self.encryptAlgorithm) < 0) {
        reject(new RangeError(encryptAlgorithmMessage));
        return;
      }

      if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
        reject(new RangeError(binaryEncodingMessage));
        return;
      }

      if (!is.string(data) || !is.inRange(data.length, 1, self.maxDataLength)) {
        reject(new TypeError('Argument \'data\' must be a string between 1 and ' + self.maxDataLength + ' characters long'));
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
    }

    // encrypt the data

    try {
      var cipher = crypto.createCipher(self.encryptAlgorithm, key);
      var buffers = [];

      cipher.on('data', function (chunk) {
        buffers.push(chunk);
      })
      .on('end', function () {
        resolve(Buffer.concat(buffers).toString(self.binaryEncoding));
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

    if (!self.skipChecks) {
      if (validEncryptAlgorithms.indexOf(self.encryptAlgorithm) < 0) {
        reject(new RangeError(encryptAlgorithmMessage));
        return;
      }

      if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
        reject(new RangeError(binaryEncodingMessage));
        return;
      }

      var minLength = self.binaryEncoding === 'base64' ? 4 : 2;
      var maxMultiplier = self.binaryEncoding === 'base64' ? 4 / 3 : 2;
      var maxLength = Math.ceil(self.maxDataLength * maxMultiplier);

      if (!is.string(data) || !is.inRange(data.length, minLength, maxLength)) {
        reject(new TypeError('Argument \'data\' must be a string between ' + minLength + ' and ' + maxLength + ' characters long'));
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
    }

    // decrypt the data

    try {
      var decipher = crypto.createDecipher(self.encryptAlgorithm, key);
      var buffers = [];

      decipher.on('data', function (chunk) {
        buffers.push(chunk);
      })
      .on('end', function () {
        resolve(Buffer.concat(buffers).toString(stringEncoding));
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

    if (!self.skipChecks) {
      if (!is.number(self.maxDataLength)) {
        reject(new TypeError(maxDataLengthMessage));
      }

      if (!is.integer(self.maxDataLength) || !is.inRange(self.maxDataLength, 1)) {
        reject(new RangeError(maxDataLengthRangeMessage));
      }

      if (!is.number(self.hashRounds)) {
        reject(new TypeError(hashRoundsMessage));
      }

      if (!is.integer(self.hashRounds) || !is.inRange(self.hashRounds, 1)) {
        reject(new RangeError(hashRoundsRangeMessage));
      }

      if (!is.number(self.hashLength)) {
        reject(new TypeError(hashLengthMessage));
      }

      if (!is.integer(self.hashLength) || !is.inRange(self.hashLength, 1)) {
        reject(new RangeError(hashLengthRangeMessage));
      }

      if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
        reject(new RangeError(binaryEncodingMessage));
      }

      if (!is.string(data) || !is.inRange(data.length, 1, self.maxDataLength)) {
        reject(new TypeError('Argument \'data\' must be a string between 1 and ' + self.maxDataLength + ' characters long'));
        return;
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
    }

    // hash the data

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
