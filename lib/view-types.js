
var View = require('treed/skins/workflowy/view')
  , ViewLayer = require('treed/skins/workflowy/vl')
  , Node = require('treed/skins/workflowy/node')

module.exports = {
  workflowy: {
    icon: 'indent',
    cls: View,
    options: {
      ViewLayer: ViewLayer,
      Node: Node
    }
  },
  whiteboard: {
    icon: 'arrows', // 'th-large' ?
    cls: require('treed/skins/whiteboard/view'),
    options: {
      ViewLayer: ViewLayer,
      Node: Node
    }
  },
  /*
  trello: {
    icon: 'columns'
  },
  mindmap: {
    icon: 'code-fork' // sideways?
  },
  */
};

