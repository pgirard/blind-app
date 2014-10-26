'use strict';

$(function () {
  var query = window.location.search.substring(1);
  var match;
  var re = /([^&=]+)=?([^&]*)/g;
  var params = {};

  function decode(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  }

  while (match = re.exec(query)) {
    params[decode(match[1])] = decode(match[2]);
  }

  var message;

  switch (params.e) {
    case '1': message = 'No file uploaded'; break;
    case '2': message = 'No encryption key provided'; break;
    case '3': message = 'Encryption key must be a base64 encoded binary value'; break;
    case '4': message = 'Could not encrypt the file'; break;
    case '5': message = 'Could not decrypt the file; may not be an encrypted file or a valid key'; break;
    case '6': message = 'Invalid option found in cookie'; break;
  }

  if (message) {
    $('#alert').html('<strong>Error:</strong> ' + message);
  }

  $('#goBack').on('click', function () {
    history.back();
  });
});
