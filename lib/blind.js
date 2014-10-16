'use strict';

var crypto = require('crypto');
var createHash = require('sha.js');
var Promise = require('bluebird');

var validEncryptAlgorithms = crypto.getCiphers();
var validHashAlgorithms = [ 'sha1', 'sha256', 'sha512' ];
var validStringEncodings = [ 'utf8', 'utf-8', 'ascii', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le' ];
var validBinaryEncodings = [ 'base64', 'hex' ];

var minRandomLength = 8;
var stringEncoding = 'utf8';
var ciphersMessage = 'see require(\'crypto\').getCiphers() for a list of valid values';

// defaults for property values

var maxRandomLengthDefault = 128;
var maxDataLengthDefault = 4096;
var encryptAlgorithmDefault = 'aes-256-cbc';
var hashRoundsDefault = 10000;
var binaryEncodingDefault = 'base64';

// utility functions

function inRange(v, min, max) {
  if (!min && min !== 0) {
    min = Number.NEGATIVE_INFINITY;
  }

  if (!max && max !== 0) {
    max = Number.POSITIVE_INFINITY;
  }

  return min <= v && v <= max;
}

function isInteger(v) {
  return Math.floor(v) === v;
}

function isNumber(v) {
  return v === v && typeof v === 'number';
}

function isString(v) {
  return typeof v === 'string';
}

// constructor

function Blind(options) {
  options = options || {};

  // set and check maxRandomLength

  this.maxRandomLength = options.maxRandomLength || maxRandomLengthDefault;

  if (!isNumber(this.maxRandomLength)) {
    throw new TypeError('Property \'maxRandomLength\' must be a number');
  }

  if (!isInteger(this.maxRandomLength) || !inRange(this.maxRandomLength, 1)) {
    throw new RangeError('Property \'maxRandomLength\' must be an integer greater than 0');
  }

  // set and check maxDataLength

  this.maxDataLength = options.maxDataLength || maxDataLengthDefault;

  if (!isNumber(this.maxDataLength)) {
    throw new TypeError('Property \'maxDataLength\' must be a number');
  }

  if (!isInteger(this.maxDataLength) || !inRange(this.maxDataLength, 1)) {
    throw new RangeError('Property \'maxDataLength\' must be an integer greater than 0');
  }

  // set and check encryptAlgorithm

  this.encryptAlgorithm = options.encryptAlgorithm || encryptAlgorithmDefault;

  if (validEncryptAlgorithms.indexOf(this.encryptAlgorithm) < 0) {
    throw new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage);
  }

  // set and check hashRounds

  this.hashRounds = options.hashRounds || hashRoundsDefault;

  if (!isNumber(this.hashRounds)) {
    throw new TypeError('Property \'hashRounds\' must be a number');
  }

  if (!isInteger(this.hashRounds) || !inRange(this.hashRounds, 1)) {
    throw new RangeError('Property \'hashRounds\' must be an integer greater than 0');
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
    if (!isNumber(self.maxRandomLength)) {
      reject(new TypeError('Property \'maxRandomLength\' must be a number'));
    }

    if (!isInteger(self.maxRandomLength) || !inRange(self.maxRandomLength, 1)) {
      reject(new RangeError('Property \'maxRandomLength\' must be an integer greater than 0'));
    }

    if (!isNumber(length)) {
      reject(new TypeError('Argument \'length\' must be a number'));
    }

    if (!isInteger(length) || !inRange(length, minRandomLength, self.maxRandomLength)) {
      reject(new RangeError('Argument \'length\' must be an integer between ' + minRandomLength + ' and ' + self.maxRandomLength));
    }

    crypto.randomBytes(length, function (error, buffer) {
      if (error) {
        reject(error);
      }
      else {
        resolve(buffer.toString(self.binaryEncoding));
      }
    });
  });
};

Blind.prototype.encrypt = function(data, key) {
  // var self = this;
  //
  // return new Promise(function (resolve, reject) {
  //
  //   // check properties and arguments
  //
  //   if (validEncryptAlgorithms.indexOf(self.encryptAlgorithm) < 0) {
  //     reject(new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage));
  //   }
  //
  //   if (validBinaryEncodings.indexOf(self.binaryEncoding) < 0) {
  //     reject(new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', ')));
  //   }
  //
  //   if (!isString(data) || !data.length) {
  //     reject(new TypeError('Argument \'data\' must be a string with one or more characters'));
  //   }
  //
  //   if (!isString(key) || !key.length) {
  //     reject(new TypeError('Argument \'key\' must be a string with one or more characters'));
  //   }
  //
  //   try {
  //     key = new Buffer(key, self.binaryEncoding);
  //   }
  //   catch (error) {
  //     reject(new TypeError('Argument \'key\' must a ' + self.binaryEncoding + ' encoded binary value'));
  //   }
  //
  //   try {
  //     var cipher = crypto.createCipher(self.encryptAlgorithm, key);
  //     var buffer = new Buffer(0);
  //
  //     cipher.on('data', function (chunk) {
  //       buffer = Buffer.concat([ buffer, chunk ]);
  //     })
  //     .on('end', function () {
  //       resolve(buffer.toString(self.binaryEncoding));
  //     })
  //     .end(data, stringEncoding);
  //   }
  //   catch (error) {
  //     reject(error);
  //   }
  // });

  var result;

  // check properties and arguments

  if (validEncryptAlgorithms.indexOf(this.encryptAlgorithm) < 0) {
    throw new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage);
  }

  if (validBinaryEncodings.indexOf(this.binaryEncoding) < 0) {
    throw new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', '));
  }

  if (!isString(data) || !data.length) {
    throw new TypeError('Argument \'data\' must be a string with one or more characters');
  }

  if (!isString(key) || !key.length) {
    throw new TypeError('Argument \'key\' must be a string with one or more characters');
  }

  // encrypt data with key

  var cipher = crypto.createCipher(this.encryptAlgorithm, key);
  result = cipher.update(data, stringEncoding, this.binaryEncoding);
  result += cipher.final(this.binaryEncoding);

  return result;
};

Blind.prototype.decrypt = function(data, key) {
  var result;

  // check properties and arguments

  if (validEncryptAlgorithms.indexOf(this.encryptAlgorithm) < 0) {
    throw new RangeError('Property \'encryptAlgorithm\' invalid; ' + ciphersMessage);
  }

  if (validBinaryEncodings.indexOf(this.binaryEncoding) < 0) {
    throw new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', '));
  }

  if (!isString(data) || !data.length) {
    throw new TypeError('Argument \'data\' must be a string with one or more characters');
  }

  if (!isString(key) || !key.length) {
    throw new TypeError('Argument \'key\' must be a string with one or more characters');
  }

  // decrypt data with key; if it fails, give a helpful message

  try {
    var decipher = crypto.createDecipher(this.encryptAlgorithm, key);
    result = decipher.update(data, this.binaryEncoding, stringEncoding);
    result += decipher.final(stringEncoding);
  }
  catch (err) {
    throw new Error('Could not decrypt data; \'data\' may not be encrypted ' +
      ' or may not have been encrypted with \'key\'');
  }


  return result;
};

Blind.prototype.hash = function(data, salt) {
  var result;

  // check properties and arguments

  if (validHashAlgorithms.indexOf(this.hashAlgorithm) < 0) {
    throw new RangeError('Property \'hashAlgorithm\' must be one of the following: ' + validHashAlgorithms.join(', '));
  }

  if (!isNumber(this.hashRounds)) {
    throw new TypeError('Property \'hashRounds\' must be a number');
  }

  if (validBinaryEncodings.indexOf(this.binaryEncoding) < 0) {
    throw new RangeError('Property \'binaryEncoding\' must be one of the following: ' + validBinaryEncodings.join(', '));
  }

  if (!isString(data) || !data.length) {
    throw new TypeError('Argument \'data\' must be a string with one or more characters');
  }

  if (salt && (!isString(salt) || !salt.length)) {
    throw new TypeError('Argument \'salt\' must be a string with one or more characters');
  }

  // hash the data, applying salt if provided, and iterate to make the processing expensive

  salt = salt || '';
  var hasher = createHash(this.hashAlgorithm);
  result = hasher.update(salt + data).digest(this.binaryEncoding);

  for (var i = 1; i < this.hashRounds; ++i) {
    result = hasher.update(result).digest(this.binaryEncoding);
  }

  return result;
};

// static methods

Blind.create = function (options) {
  return new Blind(options);
};

module.exports = Blind;
