
var React = require('react')
  , PT = React.PropTypes

  , KeyManager = require('treed/key-manager')
  , MemPL = require('treed/pl/mem')
  , files = require('../files')

  , DocHeader = require('../components/doc-header')
  , DocViewer = require('../components/doc-viewer')

function init(data, done) {
  var pl = new MemPL()
  var file = {
    title: data.title || 'Notablemind Doc',
    repl: data.repl,
  }
  files.init(file, pl, data.root, (err, store, plugins) => {
    if (err) return done(err)
    done(null, file, store, plugins)
  })
}

var BakedDoc = React.createClass({

  statics: {
    load: function (data, done) {

      init(data, (err, file, store, plugins) => {
        if (err) return done(err)

        var keys = new KeyManager()
        keys.attach(store)
        /*
        keys.addKeys({
          'g q': () => this.transitionTo('browse'),
        })
        */

        done(null, <BakedDoc
          keys={keys}
          file={file}
          store={store}
          plugins={plugins}/>)
      })
    },
  },

  propTypes: {
    file: PT.object,
    store: PT.object,
    plugins: PT.array,
    keys: PT.object,
  },
  getInitialState: function () {
    return {
      file: this.props.file
    }
  },

  componentDidMount: function () {
    window.addEventListener('keydown', this._keyDown)
    this._listenToStore(this.props.store)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this._keyDown)

    if (this.props.store) {
      this._unlistenToStore(this.props.store)
    }
  },


  // file stuff
  _listenToStore: function (store) {
    store.on(['changed'], this._onDirty)
    store.on(['node:' + store.db.root], this._onRootChanged)
  },

  _unlistenToStore: function (store) {
    store.off(['changed'], this._onDirty)
    store.off(['node:' + store.db.root], this._onRootChanged)
  },

  _onDirty: function () {
    var source = this.state.file.source
    this.state.file.modified = Date.now()
    if (!source) return
    source.dirty = true
    this.setState({file: this.state.file})
  },

  _onRootChanged: function () {
    var db = this.props.store.db
      , title = db.nodes[db.root].content
    if (title.length > 100) {
      title = title.slice(0, 98) + '..'
      window.document.title = title
    }
    this._changeTitle(title)
  },


  _keyDown: function (e) {
    if (!this.props.keys) return
    if (this.props.store.views[this.props.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
      return
    }
    return this.props.keys.keyDown(e)
  },

  _changeTitle: function (title) {
    var file = this.state.file
    file.title = title
    this.setState({file})
  },

  render: function () {
    var {store, plugins} = this.props
      , file = this.state.file

    return <div className='DocPage'>
      <DocHeader
        file={file}
        store={store}
        plugins={plugins}
        onFileUpdate={file => this.setState({file})}

        changeTitle={this._changeTitle}
      />
      <DocViewer
        file={file}
        store={store}
        plugins={plugins}
        saveWindowConfig={(_, done) => done && done()}
        keys={this.props.keys}/>
    </div>
  },
})

module.exports = BakedDoc

