
// initialize the database, getting all the data out of it to give to the
// model
// done(err, rootid, nodes)
module.exports = function (db, done) {
  db.findAll('root', function (err, roots) {
    if (err) return done(err)

    if (!roots.length) {
      return loadDefault(db, done)
    }

    db.findAll('node', function (err, nodes) {
      if (err) return done(new Error('Failed to load items'))
      if (!nodes.length) return done(new Error("Data corrupted - could not find root node"))

      var map = {}
        , id = roots[0].id
      for (var i=0; i<nodes.length; i++) {
        map[nodes[i].id] = nodes[i]
      }
      done(null, id, map)
    })
  })
}

var ROOT_ID = 50

function loadDefault(db, done) {

  // load default
  db.save('root', ROOT_ID, {id: ROOT_ID}, function () {
    var map = {}
    map[ROOT_ID] = {
      id: ROOT_ID,
      children: [],
      collapsed: false,
      content: "Home",
      meta: {},
      depth: 0
    }

    db.save('node', ROOT_ID, map[ROOT_ID], function () {
      done(null, ROOT_ID, map)
    })
  })

}

