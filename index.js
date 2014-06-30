
var NotableMind = require('./lib/index.jsx')
  , MemPL = require('treed/lib/mem-pl')

module.exports = function (node) {
  React.renderComponent(NotableMind({
    backs: {
      local: {
        title: 'Just this computer',
        shortname: 'Local',
        description: 'Everything stored in your browser, not sent to any servers.',
        icon: 'computer',
        cls: require('treed/lib/local-pl')
      },
      dropbox: {
        title: 'Dropbox',
        shortname: 'Dropbox',
        description: 'Sync with your dropbox account',
        icon: 'dropbox',
        cls: require('./lib/dropbox-pl'),
        options: {
          APP_KEY: 'd6frc2jgc64eqqp'
        }
      },
      gdrive: {
        title: 'Google Drive',
        shortname: 'Google Drive',
        description: 'Sync with Google Drive',
        icon: 'google',
        cls: require('./lib/gdrive-pl'),
        options: {
          CLIENT_ID: '956621131838-be892j0qs2mpil992t8srhp74ijm0ski.apps.googleusercontent.com'
        }
      }
    }
  }), node)
}

module.exports.demo = function (el, data) {
  var db = new MemPL()
  db.data.node = {}
  db.data.root = {}
  for (var name in data) {
    var parts = name.split(':')
    db.data[parts[0]][+parts[1]] = data[name]
  }
  React.renderComponent(NotableMind({
    initialBack: {
      type: 'mem',
      back: db
    }
  }), el);
}

