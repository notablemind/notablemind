
var NotableMind = require('./lib/index.jsx')

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

