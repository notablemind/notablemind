var MemPL = require('treed/pl/mem')
  , Db = require('treed/db')
  , treed = require('treed')

  , files = require('./files')

var uuid = require('../lib/uuid')

module.exports = {
  load: loadGist
}

function loadGist(uid, id, done) {
  getGistContents(uid, id, (err, contents) => {
    if (err) return done(err)
    initGist(contents, done)
  })
}

function getGistContents(uid, id, done) {
  var x = new XMLHttpRequest()
  x.open('get', 'https://gist.githubusercontent.com/' + uid + '/' + id + '/raw/')
  x.onreadystatechange = function () {
    if (x.readyState !== 4) return
    var data
    try {
      data = JSON.parse(x.responseText)
    } catch (e) {
      return done(new Error('invalid gist file'))
    }
    done(null, data)
  }
  x.send()
}

function initGist(data, done) {
  var pl = new MemPL()
  var file = {
    title: data.title || 'Loaded from gist',
    repl: data.repl,
  }
  files.init(file, pl, data.root, (err, store, plugins) => {
    if (err) return done(err)
    done(null, file, store, plugins)
  })
}

