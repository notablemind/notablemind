var IxPL = require('treed/pl/ixdb')
  , QueuePL = require('treed/pl/queuedb')
  , treed = require('treed')
  , kernelConfig = require('./kernels')
  , Db = require('treed/db')

var uuid = require('../lib/uuid')

module.exports = {
  // returns a listing of files, looks like
  // {"title": "string",
  //  "id": "...",
  //  "repl": null | 'ipython' | 'gorilla' | ?? }
  list: listFiles,

  // update a file
  update: updateFile,

  remove: removeFile,

  // create a new file, returns a loaded PL
  create: newFile,

  // returns a loaded PL
  get: getFile,

  // initialize files
  init: init,

  // fill a new file with data.
  populateFile: populateFile,
  importRaw: importRaw,

  dump: dump,

  // load a file from id to done
  // load: load,
}

function dump(file, done) {
  getFile(file.id, pl => {
    init(file, pl, (err, store, plugins) => {
      if (err) return done(err)
      var data = {}
      for (var name in file) {
        data[name] = file[name]
      }
      data.main = store.db.exportTree()
      done(null, data)
    })
  })
}

function updateFile(id, data, done) {
  listFiles(files => {
    var f
    saveFiles(
      files.map(file => {
        if (file.id !== id) return file
        f = file
        for (var name in data) {
          file[name] = data[name]
        }
        return file
      }), () => done(f))
  })
}

function convertToFile(data) {
  if (!Array.isArray(data)) {
    if (data.main && data.title) {
      return data
    }
    data = [data]
  }
  if (data.length === 1) {
    return {
      title: data[0].content,
      main: data[0],
      repl: 'none',
    }
  }
  return {
    title: 'Imported...',
    main: {
      content: 'Imported...',
      children: data,
    },
    repl: 'none',
  }
}

function importRaw(data, done) {
  if ('string' === typeof data) {
    try {
      data = JSON.parse(data)
    } catch (e) {
      return done(new Error('Invalid format'))
    }
  }
  importOne(data, done)
}

function importOne(data, done) {
  var fileData = convertToFile(data)
  if (!fileData) {
    return done(new Error("Invalid file format"))
  }
  newImport(fileData, (file, pl) => {
    populateFile(pl, fileData.main, (err) => {
      done(err, file)
    })
  })
}

function populateFile(pl, data, done) {
  var db = new Db(pl, [])

  db.init(data, function (err) {
    if (err) return done(err)

    done(null)
  })
}

function init(file, pl, defaultData, done) {
  if (arguments.length === 3) {
    done = defaultData
    defaultData = {content: file.title, children: []}
  }
  var config = kernelConfig[file.repl]
  var plugins = [
    require('treed/plugins/undo'),
    require('treed/plugins/todo'),
    require('treed/plugins/image'),
    require('treed/plugins/types'),
    require('treed/plugins/collapse'),
    require('treed/plugins/clipboard'),
    require('treed/plugins/lists'),
    require('treed/plugins/window-switch'),

    require('treed/plugins/rebase'),
  ]
  if (config && config.kernel) {
    // repl
    plugins.unshift(require('itreed/lib/plugin')(config))
  }

  var storeOptions = {
    data: defaultData,
    pl: pl,
  }

  treed.initStore(plugins, storeOptions, (err, store) => {
    if (err) {
      return done(err)
    }

    done(null, store, plugins)
  })
}

function listFiles(done) {
  var val = localStorage['nm:files:list']
  if (!val) return done([])
  var items
  try {
    items = JSON.parse(localStorage['nm:files:list'])
  } catch (e) {
    console.warn('Failed to parse files list. Corrupted:')
    console.warn(localStorage['nm:files:list'])
    return done([])
  }
  done(items)
}

function saveFiles(files, done) {
  localStorage['nm:files:list'] = JSON.stringify(files)
  done && done()
}

function getFile(id, isNew, done) {
  if (arguments.length === 2) {
    done = isNew
    isNew = false
  }
  var pl = new QueuePL(new IxPL({prefix: 'nm:file:' + id}))
  done(pl)
}

/**
 * Takes a title, and a repl type
 */
function newFile(title, repl, done) {
  var file = {
    id: uuid(),
    created: Date.now(),
    opened: Date.now(),
    title: title,
    repl: repl
  }
  listFiles(files =>
    saveFiles(files.concat([file]), () =>
      getFile(file.id, true, pl => done(file, pl))))
}

function newImport(fileData, done) {
  var file = {
    id: uuid(),
  }
  for (var name in fileData) {
    if (name === 'main') continue;
    file[name] = fileData[name]
  }
  listFiles(files =>
    saveFiles(files.concat([file]), () =>
      getFile(file.id, true, pl => done(file, pl))))
}

function removeFile(id, done) {
  listFiles(files => saveFiles(files.filter(x => x.id !== id), done))
}
