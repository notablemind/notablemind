/**
 * A very simple plugin that merely appends custom CSS classes to a given
 * node. Useful for light-weight custom styling.
 */

var editCustomCSS = require('./edit-custom-css');

module.exports = {
  title: 'Custom CSS',

  node: {
    classes: function (node, state) {
      return node.customCSS || ''
    },
  },

  contextMenu: function (node, store) {
    if (!node) return
    return {
      title: 'Custom CSS',
      action: 'editCustomCSS',
    }
  },

  store: {
    actions: {
      editCustomCSS: function (id) {
        var current = this.db.nodes[id].customCSS
        editCustomCSS(current, (err, classNames) => {
          if (!err) {
            this.set(id, 'customCSS', classNames)
          }
        });
      },
    },
  },
}

