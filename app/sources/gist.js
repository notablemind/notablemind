/* @flow */

var saveAsModal = require('./save-as-modal')
  , loadGistModal = require('./load-gist-modal')
  , ajax = require('./ajax')
  , oauth = require('./oauth')

module.exports = {
  title: 'Github Gist',

  link: function (config) {
    return 'https://gist.github.com/' + config.gist_id
  },

  select: function (done) {
    loadGistModal(loadGist, function (err, result, gist_id) {
      if (err) return
      var parts = gist_id.split('/')
      if (parts.length === 1) {
        parts.unshift(null)
      }
      done(err, result, {user: parts[0], gist_id: parts[1]})
    })
  },

  load: function (config, done) {
    loadGist(config.gist_id, done)
  },

  save: function (title, text, config, done) {
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
        done(null, {gist_id: result.id}, Date.now())
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
        if (err) {
          clearAuth() // TODO maybe don't do this every time
          return done(err)
        }
        done(null, {gist_id: result.id}, Date.now())
      })
    })
  },
}

var LS_KEY = 'nm_gh_token'

var CONFIG = {
  authorize: 'https://github.com/login/oauth/authorize',
  proxy: 'https://auth-server.herokuapp.com/proxy',
  redirect_uri: parent.location.origin + '/connect.html',
  client_id: 'a15ba5cf761a832d0b25',
}

function loadGist(id, done) {
  if (id.indexOf('/') !== -1) {
    id = id.split('/').slice(-1)[0]
  }
  ajax.get('https://gist.githubusercontent.com/raw/' + id, done)
}

function clearAuth() {
  delete window.localStorage[LS_KEY]
}

function authorize(done) {
  if (window.localStorage[LS_KEY]) return done(null, window.localStorage[LS_KEY])
  oauth(CONFIG, function (err, data) {
    if (err) {
      delete window.localStorage[LS_KEY]
      return done(err, null)
    }
    window.localStorage[LS_KEY] = data.access_token
    done(null, data.access_token)
  })
}

// create a gist out of the current document :D
function newGist(access_token, description, files, done) {
  ajax.post('https://api.github.com/gists', {
    'Authorization': 'token ' + access_token,
  }, {
    description: description,
    public: true,
    files: files
  }, done)
}

// update a gist out of the current document :D
function upGist(access_token, id, description, files, done) {
  ajax.post('https://api.github.com/gists/' + id, {
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
