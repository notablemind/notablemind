const React = require('react')
const EditSource = require('./EditSource')
const ShowSource = require('./ShowSource')

const eqObj = (a, b) => {
  if (a == b) return true
  if (!a || !b) return false
  if ('object' !== typeof a || 'object' !== typeof b) return false
  // WARN assuming same shape
  for (var k in b) {
    if (a[k] != b[k]) return false
  }
}

module.exports = {
  title: 'Sources',
  keys: {
    'sourcing mode': {
      normal: 'shift+4',
      insert: 'alt+shift+4',
    },
    /*
    'copy source': {
      normal: 'y s',
    },
    'paste source': {
      normal: 's p',
    },
    */
  },

  node: {

    storeAttrs: function (store, props) {
      return {
        isSourcing: store.isSourcing(props.id)
      }
    },

    getListeners(props, events) {
      // console.log('getting listeners')
      return [events.nodeViewChanged(props.id)]
    },

    blocks: {
      right: function (node, actions, state, store) {
        if (store.view.mode !== 'sourcing' || store.view.active !== node.id) {
          return <ShowSource
            id={node.id}
            source={node.source}
            store={store}
            isEmpty={!node.content}
            isActive={store.view.active === node.id}
          />
        }
        return <EditSource
          source={node.source}
          content={node.content}
          onDone={(source) => {
            const hasContent = source.who || source.url || source.what || source.when
            actions.setSource(node.id, hasContent ? source : null)
            actions.normalMode()
          }}
          onCancel={ () => actions.normalMode() }
        />
      }
    }
  },

  store: {
    actions: {
      sourcingMode(id) {
        if (!arguments.length) id = this.view.active
        this.setActive(id)
        this.view.mode = 'sourcing'
        this.changed(this.events.modeChanged())
        this.changed(this.events.nodeViewChanged(id))
      },

      copySource(id) {
        if (!arguments.length) id = this.view.active
        this.globals.copiedSource = {...this.db.nodes[id].source}
        console.log('copied', this.globals)
      },

      pasteSource(id) {
        if (!arguments.length) id = this.view.active
        if (this.globals.copiedSource) {
          this.set(id, 'source', {...this.globals.copiedSource})
        }
      },

      setSource(id, source) {
        if (eqObj(this.db.nodes[id].source, source)) {
          return
        }
        this.set(id, 'source', source)
      },
    },

    extend: {
      isSourcing: function (id) {
        return 'sourcing' === this.view.mode && id === this.view.active
      },
    }
  },
}
