
var initDb = require('./init-db')

// db: a backend
// Model: the model class
// done(err, model)
module.exports = function (db, Model, done) {
  initDb(db, function (err, id, nodes) {
    if (err) return done(err)
    var model = window.model = new Model(id, nodes, db)
    done(null, model)
  })
}

