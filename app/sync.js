
var SOURCES = require('./sources')
  , treesToMap = require('treed/rx/util/trees-to-map')

module.exports = {
  just_save: just_save,
  sync: sync,
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


