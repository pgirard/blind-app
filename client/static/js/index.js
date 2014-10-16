'use strict';

$(function () {
  var binaryEncoding = 'base64';

  var $randomResult = $('#randomResult');
  var $encryptKey = $('#encryptKey');
  var $hashSalt = $('#hashSalt');
  var $hashData = $('#hashData');
  var $encryptForm = $('#encryptForm');
  var $plainTextData = $('#plainTextData');
  var $encryptedData = $('#encryptedData');
  var $uploadFile = $('#uploadFile');
  var $uploadType = $('#uploadType');

  $('#getRandom').on('click', function () {
    var length = parseFloat($('#randomLength').val());

    if (!isNumber(length) || !isInteger(length) || !inRange(length, 8, 128)) {
      showError('Length must be a whole number between 8 and 128');
      return;
    }

    $.ajax({
      url: '/api/random',
      data: {
        length: length
      },
      dataType: 'json',
      type: 'POST'
    })
    .done(function (result) {
      selectContent($randomResult.val(result.value));
    })
    .fail(function (xhr, err, message) {
      showError(xhr.responseText);
    });
  });

  $('#goEncryption').on('click', function () {
    var random = $randomResult.val();

    if (random) {
      $encryptKey.val(random);
      $('#encryptTab').trigger('click');
    }
  });

  $('#goHashing').on('click', function () {
    var random = $randomResult.val();

    if (random) {
      $hashSalt.val(random);
      $('#hashTab').trigger('click');
    }
  });

  $('#getEncrypted').on('click', function () {
    var key = $encryptKey.val();
    var data = $plainTextData.val();

    if (!key) {
      showError('Key must be one or more characters');
      return;
    }

    if (!isEncodedBinary(key, binaryEncoding)) {
      showError('Key must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    if (!data) {
      showError('Data must be one or more characters');
      return;
    }

    $.ajax({
      url: '/api/encrypt',
      data: {
        key: key,
        data: data
      },
      dataType: 'json',
      type: 'POST'
    })
    .done(function (result) {
      selectContent($encryptedData.val(result.value));
    })
    .fail(function (xhr, err, message) {
      showError(xhr.responseText);
    });
  });

  $('#getDecrypted').on('click', function () {
    var key = $encryptKey.val();
    var encrypted = $encryptedData.val();

    if (!key) {
      showError('Key must be one or more characters');
      return;
    }

    if (!isEncodedBinary(key, binaryEncoding)) {
      showError('Key must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    if (!encrypted) {
      showError('Encrypted must be one or more characters');
      return;
    }

    if (!isEncodedBinary(encrypted, binaryEncoding)) {
      showError('Encrypted must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    $.ajax({
      url: '/api/decrypt',
      data: {
        key: key,
        encrypted: encrypted
      },
      dataType: 'json',
      type: 'POST'
    })
    .done(function (result) {
      selectContent($plainTextData.val(result.value));
    })
    .fail(function (xhr, err, message) {
      showError(xhr.responseText);
    });
  });

  $('#encryptFile').on('click', function () {
    var key = $encryptKey.val();

    if (!key) {
      showError('Key must be one or more characters');
      return;
    }

    if (!isEncodedBinary(key, binaryEncoding)) {
      showError('Key must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    if (!$uploadFile.val()) {
      showError('Choose a file to encrypt first');
      return;
    }

    $uploadType.val('encrypt');
    $encryptForm.submit();
  });

  $('#decryptFile').on('click', function () {
    var key = $encryptKey.val();

    if (!key) {
      showError('Key must be one or more characters');
      return;
    }

    if (!isEncodedBinary(key, binaryEncoding)) {
      showError('Key must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    if (!$uploadFile.val()) {
      showError('Choose a file to decrypt first');
      return;
    }

    $uploadType.val('decrypt');
    $encryptForm.submit();
  });

  $('#getHashed').on('click', function () {
    var data = $hashData.val();
    var salt = $hashSalt.val();

    if (!data) {
      showError('Data must be one or more characters');
      return;
    }

    if (salt && !isEncodedBinary(salt, binaryEncoding)) {
      showError('Salt must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    $.ajax({
      url: '/api/hash',
      data: {
        salt: salt,
        data: data
      },
      dataType: 'json',
      type: 'POST'
    })
    .done(function (result) {
      selectContent($('#hashResult').val(result.value));
    })
    .fail(function (xhr, err, message) {
      showError(xhr.responseText);
    });
  });

  function inRange(v, min, max) {
    if (min !== 0 && !min) {
      min = Number.NEGATIVE_INFINITY;
    }

    if (max !== 0 && !max) {
      max = Number.POSITIVE_INFINITY;
    }

    return min <= v && v <= max;
  }

  function isInteger(v) {
    return Math.floor(v) === v;
  }

  function isEncodedBinary(v, encoding) {
    switch (encoding) {
      case 'base64':
        return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(v);
      case 'hex':
        return /^[A-Da-d0-9]+$/.test(v);
    }
  }

  function isNumber(v) {
    return v === v && typeof v === 'number';
  }

  function isString(v) {
    return typeof v === 'string';
  }

  function selectContent($input) {
    $input.focus().prop('selectionStart', 0).prop('selectionLength', $input.val().length);
  }

  function showError(message) {
    $('#alert').html('<strong>Error:</strong> ' + message).hide().fadeIn().delay(3000).fadeOut();
  }
});
