
var LocalPL = require('treed/lib/local-pl')
  , api = require('./gdrive-api')
  , _ = require('lodash')

module.exports = GoogleDrivePL

var FILENAME = 'notablemind.nm'

var SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  // Add other scopes needed by your application.
];

function GoogleDrivePL(options) {
  this.options = options
  if (!options.CLIENT_ID) {
    throw new Error('Cannot use a gdrive backend without a client id')
  }

  this.pl = new LocalPL('gdrive')
  this._throttledUpdate = _.throttle(this._update.bind(this), 30000)
}

GoogleDrivePL.prototype = {
  init: function (done) {
    api.auth(this.options.CLIENT_ID, SCOPES, function (err) {
      if (err) return done(err)
      gapi.client.load('drive', 'v2', this._load.bind(this, done))
    }.bind(this))
  },
  _load: function (done) {
    if (localStorage._gdrive_file_id) {
      api.get(localStorage._gdrive_file_id, function (err, meta, data) {
        if (err) {
          delete localStorage._gdrive_file_id;
          return this._load(done)
        }
        if (meta.code === 404) {
          console.log("File not found -- probably deleted")
          delete localStorage._gdrive_file_id;
          return this._load(done)
        }
        if (meta.labels && meta.labels.trashed) {
          console.log("File was trashed")
          delete localStorage._gdrive_file_id;
          return this._load(done)
        }
        this._loaded(data, done)
      }.bind(this))
      // return this._load_by_id(localStorage._gdrive_file_id, done)
    }
    api.find(FILENAME, function (err, results) {
      if (!results.length) {
        return this._create_blank(done)
      }
      var result = false
      results.some(function (one) {
        if (one.labels.trashed) return
        result = one
        return true
      })
      if (!result) {
        return this._create_blank(done)
      }
      localStorage._gdrive_file_id = result.id
      api.getContents(result.downloadUrl, function (err, contents) {
        if (err) return done(err)
        this._loaded(contents, done)
      }.bind(this))
    }.bind(this))
  },
  _create_blank: function (done) {
    api.create({
      fileName: FILENAME,
      type: 'application/x-notablemind',
      body: '{"nodes": {}}'
    }, function (err, meta) {
      localStorage._gdrive_file_id = meta.id
      done()
    })
  },
  _load_by_id: function (id, done) {
    api.get(id, function (err, meta, data) {
      if (err) return done(err)
      if (meta.code === 404) {
        return done(new Error("File not found -- probably deleted"))
      }
      if (meta.labels && meta.labels.trashed) {
        return done(new Error("File was trashed"))
      }
      this._loaded(data, done)
    }.bind(this))
  },
  _loaded: function (contents, done) {
    var data
    try {
      data = JSON.parse(contents)
    } catch (e) {
      console.log("PARSE ERROR! Data corruption.", e, contents)
      return done(e)
    }
    this.pl.load(data, done, true)
  },
  _serialize: function (done) {
    this.pl.dump(done)
  },
  _update: function () {
    if (!localStorage._gdrive_file_id) {
      return console.error("Cannot dump data - no file id in localstorage")
    }
    var id = localStorage._gdrive_file_id
    this.pl.dump(function (err, data) {
      if (err) return console.error("Failed to dump data", err)
      api.update(id, JSON.stringify(data), function () {
        console.log('Saved')
      })
    })
  },
  // public interface
  save: function (type, id, data, done) {
    this.pl.save(type, id, data, function (err) {
      if (err) return done && done(err)
      this._throttledUpdate()
      done && done()
    }.bind(this))
  },
  find: function (type, id, done) {
    this.pl.find(type, id, done)
  },
  update: function (type, id, update, done) {
    this.pl.update(type, id, update, function (err) {
      if (err) return done && done(err)
      this._throttledUpdate()
      done && done()
    }.bind(this))
  },
  remove: function (type, id, done) {
    this.pl.remove(type, id, function (err) {
      if (err) return done && done(err)
      this._throttledUpdate()
      done && done()
    }.bind(this))
  },
  findAll: function (type, done) {
    this.pl.findAll(type, done)
  }
}

