
module.exports = {
  auth: auth,

  get: get,
  getInfo: getInfo,
  getContents: getContents,

  find: find,
  create: create,
  update: update
}

function auth(id, scopes, done) {
  if (!gapi || !gapi.auth) {
    console.log("gapi not loaded, punting...")
    return setTimeout(auth.bind(null, id, scopes, done), 100)
  }
  gapi.auth.authorize({
    client_id: id,
    scope: scopes.join(' '),
    immediate: true
  }, function (authResult) {

    if (authResult) {
      // Access token has been successfully retrieved, requests can be sent to the API
      return done()
    }

    // No access token could be retrieved, force the authorization flow.
    gapi.auth.authorize({
      client_id: id,
      scope: scopes.join(' '),
      immediate: false
    }, function (authorized) {
      if (!authorized) {
        return done(new Error("Authorization not granted"))
      }
      done()
    })
  })
}

function find(filename, done) {

  var request = gapi.client.drive.files.list({
    q: "title = '" + filename + "'"
  })

  var next = function (request, results) {
    request.execute(function (resp) {
      results = results.concat(resp.items || [])
      if (!resp.nextPageToken) {
        return done(null, results)
      }
      next(gapi.client.drive.files.list({
        pageToken: resp.nextPageToken
      }), results)
    })
  }

  next(request, [])
}


/**
 * Update an existing file's metadata and content.
 *
 * @param {String} fileId ID of the file to update.
 * @param {Function} callback Callback function to call when the request is complete.
 */
function update(fileId, fileData, callback) {

  var request = gapi.client.request({
    'path': '/upload/drive/v2/files/' + fileId,
    'method': 'PUT',
    'params': {'uploadType': 'media'},
    'headers': {
      'Content-Type': 'application/x-notablemind',
    },
    'body': fileData
  });

  request.execute(function (meta) {
    callback(null, meta)
  })
}


/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function create(fileData, callback) {
  var boundary = '-------314159265358979323846';
  var delimiter = "\r\n--" + boundary + "\r\n";
  var close_delim = "\r\n--" + boundary + "--";

  var contentType = fileData.type || 'application/octet-stream';
  var metadata = {
    'title': fileData.fileName,
    'mimeType': contentType
  };

  var base64Data = btoa(fileData.body);
  var multipartRequestBody =
  delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + contentType + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    base64Data +
    close_delim;

  var request = gapi.client.request({
    'path': '/upload/drive/v2/files',
    'method': 'POST',
    'params': {'uploadType': 'multipart'},
    'headers': {
      'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
    },
    'body': multipartRequestBody});
  request.execute(function (meta) {
    callback(null, meta)
  });
}

function get(id, done) {
  getInfo(id, function (err, meta) {
    if (err) return done(err)
    getContents(meta.downloadUrl, function (err, data) {
      done(err, meta, data)
    })
  })
}

function getInfo(id, done) {
  var request = gapi.client.drive.files.get({
    'fileId': id
  });
  request.execute(function(resp) {
    done(null, resp)
  });
}

function getContents(url, done) {
  var accessToken = gapi.auth.getToken().access_token;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.onload = function() {
    done(null, xhr.responseText);
  };
  xhr.onerror = function() {
    done(new Error("XHR Error downloading data"))
  };
  xhr.send();
}

