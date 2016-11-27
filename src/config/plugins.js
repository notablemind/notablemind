
const plugins = [
  require('treed/plugins/undo'),
  require('treed/plugins/todo'),
  require('treed/plugins/disable'),
  require('treed/plugins/image'),
  require('treed/plugins/types'),
  require('treed/plugins/collapse'),
  require('treed/plugins/clipboard'),
  require('treed/plugins/lists'),
  require('treed/plugins/rebase'),
  require('treed/plugins/tables'),
  require('treed/plugins/tags'),
  require('../treed-plugins/custom-css'),
  require('../treed-plugins/child-count'),
  require('../treed-plugins/source'),
  require('../treed-plugins/symlink'),
  // require('./treed-plugins/scriptures'),
]

if (ELECTRON) {
  plugins.push(require('../treed-plugins/local-attach/'));
}

export default plugins
