'use strict';

$(function () {
  $.cookie.json = true;

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

    if (!is.number(length) || !is.int(length) || !is.within(length, 8, 128)) {
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

    if (!is[binaryEncoding](key)) {
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

    if (!is[binaryEncoding](key)) {
      showError('Key must be a ' + binaryEncoding + ' encoded binary string');
      return;
    }

    if (!encrypted) {
      showError('Encrypted must be one or more characters');
      return;
    }

    if (!is[binaryEncoding](encrypted)) {
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

    if (!is[binaryEncoding](key)) {
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

    if (!is[binaryEncoding](key)) {
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

    if (salt && !is[binaryEncoding](salt)) {
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

  $('#saveOptions').on('click', function () {
    var numRegex = /^\d+$/;
    var v = $('#hashRounds').val();

    if (!numRegex.test(v) || parseInt(v, 10) < 1) {
      showError('hash rounds must be an integer greater than zero');
      return;
    }

    v = $('#maxDataLength').val();

    if (!numRegex.test(v) || parseInt(v, 10) < 1) {
      showError('max data length must be an integer greater than zero');
      return;
    }

    v = $('#maxRandomLength').val();

    if (!numRegex.test(v) || parseInt(v, 10) < 9) {
      showError('max random length must be an integer greater than 8');
      return;
    }

    var options = {};

    $('#optionsForm .blind-option').each(function () {
      var $this = $(this);
      options[$this.attr('id')] = parseInt($this.val(), 10) || $this.val();
    });

    $.cookie('blind', options, { expires: 180 });
  });

  var is = {
    base64: function (v) {
      return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(v);
    },

    int: function (v) {
      return Math.floor(v) === v;
    },

    hex: function (v) {
      return /^[A-Da-d0-9]+$/.test(v);
    },

    number: function (v) {
      return v === v && typeof v === 'number';
    },

    within: function (v, min, max) {
      return min <= v && v <= max;
    }
  };

  function selectContent($input) {
    $input.focus().prop('selectionStart', 0).prop('selectionLength', $input.val().length);
  }

  function showError(message) {
    $('#alert').html('<strong>Error:</strong> ' + message).hide().fadeIn().delay(3000).fadeOut();
  }
});
