
var ajax = require('./ajax')
  , googleAuthModal = require('./google-auth-modal')
  , loadGDriveModal = require('./load-gdrive-modal')

module.exports = {
  title: 'Google Drive',

  link: function (config) {
    return 'https://drive.google.com/open?id=' + config.id
  },

  select: function (done) {
    authorize((err, token) => {
      loadGDriveModal(listFiles, downloadFile, (err, contents, file) => {
        if (err) return done(err)
        done(null, contents, getConfigFromFile(file))
      })
    })
    done(new Error('import from gdrive not yet supported'))
  },

  head: function (config, done) {
    authorize(err => {
      if (err) return done(err)
      var accessToken = gapi.auth.getToken().access_token
      ajax.get('https://www.googleapis.com/drive/v2/files/' + config.id, {
        'Authorization': 'Bearer ' + accessToken,
      }, (err, file) => {
        if (err) return done(err)
        done(null, new Date(file.modifiedDate).getTime(), file.downloadUrl)
      });
    })
  },

  load: function (config, downloadUrl, done) {
    authorize(err => {
      if (err) return done(err)
      downloadFile(downloadUrl, done)
    })
  },

  save: function (config, title, text, done) {
    authorize(err => {
      if (err) return done(err)
      updateFile(config.id, {title: title + '.nm'}, text, (file) => done(null, getConfigFromFile(file), new Date(file.modifiedDate).getTime()))
    })
  },

  saveAs: function (title, text, done) {
    authorize(err => {
      if (err) return done(err)
      uploadFile(title, text, (file) => done(null, getConfigFromFile(file), new Date(file.modifiedDate).getTime()))
    })
  },

}

var CONFIG = {
  client_id: process.env.GDRIVE_CLIENT_ID,
  scopes: 'https://www.googleapis.com/auth/drive',
}

function authorize(done) {
  // TODO save something to localstorage so we don't always do this RTT
  var token = gapi.auth.getToken()
  if (token && (+token.expires_at * 1000) > Date.now()) return done(null)
  gapi.auth.authorize({
    client_id: CONFIG.client_id,
    scope: CONFIG.scopes,
    immediate: true,
  }, result => {
    if (result && !result.error) {
      return done(null)
    }
    googleAuthModal((done) => {
      gapi.auth.authorize({
        client_id: CONFIG.client_id,
        scope: CONFIG.scopes,
        immediate: false,
      }, result => {
        if (result && !result.error) {
          return done(null)
        }
        done(new Error('not authorized'))
      })
    }, done)
  })
}

function getConfigFromFile(file) {
  return {
    id: file.id,
    etag: file.etag,
    created: file.createdDate,
    modified: file.modifiedDate,
    link: file.webContentLink,
    shared: file.shared
  }
}

function listFiles(done) {
  var accessToken = gapi.auth.getToken().access_token
  ajax.get('https://www.googleapis.com/drive/v2/files?q=' + encodeURIComponent("mimeType = 'application/vnd.notablemind'"), {
    'Authorization': 'Bearer ' + accessToken,
  }, (err, body) => {
    if (err || body.error) return done(err || body.error)
    // TODO care about paging
    done(null, body.items)
  })
}

function downloadFile(downloadUrl, done) {
  var accessToken = gapi.auth.getToken().access_token
  ajax.get(downloadUrl, {
    'Authorization': 'Bearer ' + accessToken,
  }, done)
}


function uploadFile(title, fileData, done) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var contentType = 'application/vnd.notablemind';
  var metadata = {
    'title': title + '.nm',
    'mimeType': contentType
  };

  var base64Data = btoa(fileData);
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
  request.execute(done);
}



function updateFile(fileId, fileMetadata, fileData, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

    var contentType = 'application/vnd.notablemind'
    // Updating the metadata is optional and you can instead use the value from drive.files.get.
    var base64Data = btoa(fileData);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files/' + fileId,
        'method': 'PUT',
        'params': {'uploadType': 'multipart', 'alt': 'json', 'setModifiedDate': true},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    request.execute(callback);
}
