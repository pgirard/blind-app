'use strict';

module.exports = {
  inRange: function (v, min, max) {
    if (min !== 0 && !min) {
      min = Number.NEGATIVE_INFINITY;
    }

    if (max !== 0 && !max) {
      max = Number.POSITIVE_INFINITY;
    }

    return min <= v && v <= max;
  },

  encodedBinary: function (v, encoding) {
    switch (encoding) {
      case 'base64':
        return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(v);
      case 'hex':
        return /^[A-Da-d0-9]+$/.test(v);
    }
  },

  integer: function (v) {
    return Math.floor(v) === v;
  },

  number: function (v) {
    return v === v && typeof v === 'number';
  },

  string: function (v) {
    return typeof v === 'string';
  }
};
