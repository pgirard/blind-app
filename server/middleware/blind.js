'use strict';

var Blind = require('blind');

module.exports = function (req, res, next) {
  var options;

  if (req.cookies && req.cookies.blind) {
    options = JSON.parse(req.cookies.blind);
  }

  try {
    req.blind = new Blind(options);
    return next();
  }
  catch (error) {
    if (req.headers.accept.indexOf('application/json') >= 0) {
      return res.send(500);
    }
    else {
      return res.redirect('/error.html?e=6');
    }
  }
};
