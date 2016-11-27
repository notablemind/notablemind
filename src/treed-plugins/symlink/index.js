var uuid = require('treed/lib/uuid')
const Symlink = require('./Symlink')

const makeSymlinkTree = (nodes, root) => {
  if (!nodes[root]) return
  const content = nodes[root].type === 'symlink' ? nodes[root].content : root
  return {
    type: 'symlink',
    content,
    collapsed: nodes[root].collapsed,
    children: (nodes[root].children || []).map(id => makeSymlinkTree(nodes, id)).filter(x => !!x),
  }
}

module.exports = {
  title: 'Symlinks',

  types: {
    symlink: {
      shortcut: 'k',
      title: 'Symlink',
      description: 'A symlink',
      newNodesAreNormal: true, // TODO this does nothing
    },
  },

  keys: {
    'jump to symlink': {
      type: 'symlink',
      normal: 'alt+enter',
    },
    'symlink to clipboard': {
      normal: 'y k',
    },
    'symlink tree to clipboard': {
      normal: 'y shift+k',
    },
  },

  node: {
    bodies: {
      symlink: {
        Component: Symlink,
      },
    },
  },

  contextMenu(node, store) {
    if (!node) return
    return [{
      title: 'Symlink to clipboard',
      action: 'symlinkToClipboard',
      shortcut: 'y k',
      disabled: node.type === 'symlink',
    }, {
      title: 'Symlink tree to clipboard',
      action: 'symlinkTreeToClipboard',
      shortcut: 'y K',
    }]
  },

  store: {
    actions: {
      symlinkToClipboard(id) {
        if (!arguments.length) id = this.view.active
        if (this.db.nodes[id].type === 'symlink') return
        this.globals.clipboard = [{
          content: id,
          type: 'symlink',
        }]
      },

      symlinkTreeToClipboard(id) {
        if (!arguments.length) id = this.view.active
        this.globals.clipboard = [makeSymlinkTree(this.db.nodes, id)]
      },

      jumpToSymlink(id) {
        if (!arguments.length) id = this.view.active
        if (this.db.nodes[id].type !== 'symlink') return
        if (!this.db.nodes[this.db.nodes[id].content]) return
          // TODO this doesn't work if you don't have a common root in view
        this.expandToAndSelect(this.db.nodes[id].content)
      },
    },
  },
}
