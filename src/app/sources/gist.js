/* @flow */

import secrets from '../../secrets'

var saveAsModal = require('./save-as-modal')
  , loadGistModal = require('./load-gist-modal')
  , ajax = require('./ajax')
  , oauth = require('./oauth')

module.exports = {
  title: 'Github Gist',

  link: function (config) {
    return 'https://gist.github.com/' + config.gist_id
  },

  share: function (config) {
    // TODO view.notablemind.org
    return 'https://app.notablemind.org/#/gist/' + config.gist_id
  },

  select: function (done) {
    authorize((err, token) => {
      loadGistModal(loadGist.bind(null, token), function (err, result, gist_id) {
        if (err) return
        var parts = gist_id.split('/')
        if (parts.length === 1) {
          parts.unshift(null)
        }
        done(err, result, {user: parts[0], gist_id: parts[1]})
      })
    })
  },

  head: function (config, done) {
    authorize((err, token) => {
      headGist(token, config.gist_id, (err, result) => {
        if (err) return done(err)
        if (!result.files['Document.nm']) {
          return done('Gist has become corrupted')
        }
        var content = result.files['Document.nm'].truncated ? null :
          result.files['Document.nm'].content
        done(null, new Date(result.updated_at).getTime(), content)
      })
    })
  },

  load: function (config, headContent, done) {
    if (headContent) return done(headContent)
    authorize((err, token) => {
      loadGist(token, config.gist_id, done)
    })
  },

  save: function (config, title, text, done) {
    authorize((err, token) => {
      if (err) return done(err)
      var files = {}
      // TODO fix things, keep track of filenames so that we can use the title
      // as the filename. Might be nice.
      files['Document.nm'] = {content: text}
      upGist(token, config.gist_id, title, files, (err, result) => {
        if (err) {
          clearAuth() // TODO maybe don't do this every time
          return done(err)
        }
        done(null, {gist_id: result.id}, new Date(result.updated_at).getTime())
      })
    })
  },

  saveAs: function (title, text, done) {
    authorize((err, token) => {
      // TODO clear auth token?
      if (err) return done(err)
      var files = {}
      files['Document.nm'] = {content: text}
      newGist(token, title, files, (err, result) => {
        if (err || !result.id) {
          clearAuth() // TODO maybe don't do this every time
          return done(err || new Error('failed to create gist'))
        }
        done(null, {gist_id: result.id}, new Date(result.updated_at).getTime())
      })
    })
  },
}

var LS_KEY = 'nm_gh_token'

var CONFIG = {
  authorize: 'https://github.com/login/oauth/authorize',
  proxy: 'https://auth-server.herokuapp.com/proxy',
  redirect_uri: parent.location.origin + '/connect.html',
  client_id: secrets.github.clientId,
  api: 'https://api.github.com/gists/',
}

function headGist(access_token, id, done) {
  if (id.indexOf('/') !== -1) {
    id = id.split('/').slice(-1)[0]
  }
  ajax.get(CONFIG.api + id, {
    'Authorization': 'token ' + access_token,
  }, done)
}

function loadGist(access_token, id, done) {
  ajax.get('https://gist.githubusercontent.com/' + id + '/raw/', {
    // 'Authorization': 'token ' + access_token,
  }, done)
}

function clearAuth() {
  delete window.localStorage[LS_KEY]
}

function authorize(done) {
  if (window.localStorage[LS_KEY]) return done(null, window.localStorage[LS_KEY])
  oauth(CONFIG, function (err, data) {
    if (err) {
      clearAuth()
      return done(err, null)
    }
    window.localStorage[LS_KEY] = data.access_token
    done(null, data.access_token)
  })
}

// create a gist out of the current document :D
function newGist(access_token, description, files, done) {
  ajax.post(CONFIG.api.slice(0, -1), {
    'Authorization': 'token ' + access_token,
  }, {
    description: description,
    public: true,
    files: files
  }, done)
}

// update a gist out of the current document :D
function upGist(access_token, id, description, files, done) {
  ajax.post(CONFIG.api + id, {
    'Authorization': 'token ' + access_token,
  }, {
    description: description,
    public: true,
    files: files
  }, done)
}

// save the current document to a gist (OLD)
function saveToGist(access_token, store, done) {
  var files = {
    'Document.nm': {
      content: JSON.stringify(store.db.exportTree(), null, 2)
    }
  }
  var description = store.db.nodes[store.db.root].content
  if (!store._globals.gistId) {
    newGist(access_token, description, files, function (result) {
      store._globals.gistId = result.id
      done && done()
    })
  } else {
    upGist(access_token, store._globals.gistId, description, files, done)
  }
}
