
var SOURCES = require('./sources')
  , treesToMap = require('treed/util/trees-to-map')
  , localFiles = require('./files')
  , deepEqual = require('deep-equal')

module.exports = {
  doSync: doSync,
}

function exportContents(file, store) {
  return JSON.stringify({
    title: file.title,
    created: file.created,
    opened: file.opened,
    repl: file.repl,
    root: store.db.exportTree(null, true)
  }, null, 2)
}

function commit(file, store, done) {
  console.log('commit local changes')
  var source = file.source
    , src = SOURCES[source.type]
    , text = exportContents(file, store)
    , title = store.db.nodes[store.db.root].content
  return src.save(source.config, title, text, (err, config, time) => {
    if (err) {
      return done(err)
    }
    source.config = config
    source.synced = time
    source.dirty = false
    localFiles.update(file.id, {
      source: source
    }, file => {
      done(null, file)
    })
  })
}

function maybe_get(content, file, store, updated_at, fn, done) {
  if (content) {
    return fn(file, store, content, updated_at, done)
  }
  var source = file.source
  SOURCES[source.type].load(source.config, result => {
    fn(file, store, result, updated_at, done)
  })
}

// apply the contents of `content` to the store
function apply(file, store, content, updated_at, done) {
  console.log('apply remote changes')
  var data = content
  if ('string' === typeof data) {
    try {
      data = JSON.parse(data)
    } catch (e) {
      return done('Gist has become corrupted (invalid json)')
    }
  }
  var db = store.db

  // roots shouldn't change...
  data.root.id = db.root
  crawl(data.root, null)

  file.source.synced = updated_at
  localFiles.update(file.id, {
    source: file.source
  }, file => {
    done(null, file)
  })
  // TODO wait to call done until after the DB operations are finished

  function crawl(node, pid) {
    node.children = node.children.map(child => {
      crawl(child, node.id)
      return child.id
    })
    node.parent = pid
    if (!db.nodes[node.id]) {
      return db.save(node.id, node)
    }
    if (node.modified === db.nodes[node.id].modified) return
    if (deepEqual(node, db.nodes[node.id])) return
    db.save(node.id, node)
    store.changed(store.events.nodeChanged(node.id))
  }
}

function merge_and_commit(file, store, content, updated_at, done) {
  console.log('merge and commit')
  var data = content
  if ('string' === typeof data) {
    try {
      data = JSON.parse(data)
    } catch (e) {
      return done('Gist has become corrupted (invalid json)')
    }
  }
  var db = store.db

  var {nodes, roots} = treesToMap([data.root], null, true)
  var ids = Object.keys(nodes)
  for (var id in db.nodes) {
    if (!nodes[id]) ids.push(id)
  }
  // ids is now a full list of all ids
  ids.forEach(id => {
    // my addition or their deletion
    if (!nodes[id]) {
      var pid = db.nodes[id].parent
      while (!nodes[pid] && pid) {
        pid = db.nodes[pid].parent
      }
      if (!pid) return console.warn('failed to find a common ancestor...')
      if (nodes[pid].modified > db.nodes[pid].modified) {
        // was deleted remotely
        db.remove(id)
      } else {
        // I added it. it stays.
      }
      return
    }

    // remote addition or my deletion
    if (!db.nodes[id]) {
      var pid = nodes[id].parent
      while (!db.nodes[pid] && pid) {
        pid = nodes[pid].parent
      }
      if (!pid) return console.warn('failed to find a common ancestor...')
      if (nodes[pid].modified > db.nodes[pid].modified || db.nodes[pid].children.indexOf(id) !== -1) {
        // was added remotely
        db.save(id, nodes[id], nodes[id].modified)
        store.changed(store.events.nodeChanged(id))
      } else {
        // I deleted it.
      }
      return
    }

    // both have the node
    if (nodes[id].modified > db.nodes[id].modified) {
      // remote node is newer
      db.save(id, nodes[id], nodes[id].modified)
      store.changed(store.events.nodeChanged(id))
    } else {
      // mine is newer
    }
  })

  commit(file, store, done)
}

function doSync(file, store, done) {
  var source = file.source
    , localModified = file.modified
    , src = SOURCES[source.type]

  src.head(source.config, (err, lastModified, content) => {
    if (err) {
      return done(err)
    }
    if (lastModified <= source.synced || !source.synced) {
      if (source.dirty) {
        return commit(file, store, done)
      } else {
        return done()
      }
    } else {
      if (!source.dirty && localModified <= lastModified) {
        return maybe_get(content, file, store, lastModified, apply, done)
      } else {
        return maybe_get(content, file, store, lastModified, merge_and_commit, done)
      }
    }
  })
}

function just_save(title, text, source, done) {
  source.dirty = false // TODO is this in the right place?
  SOURCES[source.type].save(title, text, source.config, (err, config, time) => {
    if (err) return done(new Error('Failed to save'))
    source.synced = time
    done(source)
  })
}

function sync(root, nodes, remote) {
  for (var name in remote) {
  }
}


