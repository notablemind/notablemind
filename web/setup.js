
var NotableMind = require('../lib/index.jsx')
  , base = document.getElementById('example')

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
      cls: require('../lib/dropbox-pl'),
      options: {
        APP_KEY: 'd6frc2jgc64eqqp'
      }
    }
  }
}), base)


