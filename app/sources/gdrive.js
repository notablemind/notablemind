
var ajax = require('./ajax')
  , googleAuthModal = require('./google-auth-modal')

module.exports = {
  title: 'Google Drive',
  
  link: function (config) {
    return 'http://example.com/' + config.id
  },

  select: function (done) {
    done(new Error('import from gdrive not yet supported'))
  },

  head: function (config, done) {
    authorize(err => {
      if (err) return done(err)
      var request = gapi.client.drive.files.get({
        'fileId': fileId
      });
      request.execute(function(resp) {
        done(null, new Date(resp.modifiedDate).getTime(), resp.downloadUrl)
      });
    })
  },

  load: function (config, downloadUrl, done) {
    authorize(err => {
      downloadFile(downloadUrl, done)
    })
  },

  save: function (config, title, text, done) {
    authorize(err => {
      if (err) return done(err)
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

function downloadFile(downloadUrl, done) {
  var accessToken = gapi.auth.getToken().access_token
  ajax.get(downloadUrl, {
    'Authorization': 'Bearer ' + accessToken,
  }, done)
}

