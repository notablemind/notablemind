var React = require('react')
  , {Navigation, State} = require('react-router')

  , KeyManager = require('treed/key-manager')
  , keys = require('treed/lib/keys')
  , files = require('../files')

  , DocHeader = require('../components/doc-header')
  , DocViewer = require('../components/doc-viewer')

function dehydrateWindows(config) {
  if (config.leaf) {
    return {
      leaf: true,
      value: {
        root: config.value.root,
        type: config.value.type,
      },
    }
  }
  return {
    leaf: false,
    value: {
      first: dehydrateWindows(config.value.first),
      second: dehydrateWindows(config.value.second),
      ratio: config.value.ratio,
      orient: config.value.orient,
    },
  }
}

var DocPage = React.createClass({
  mixins: [Navigation, State],

  componentDidMount: function () {
    this.loadFile()
    window.addEventListener('keydown', this._keyDown)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this._keyDown)

    if (this.state.store) {
      this._unlistenToStore(this.state.store)
    }
  },

  getInitialState: function () {
    return {
      loading: false,
      error: null,
    }
  },

  // file stuff
  _listenToStore: function (store) {
    store.on(['node:' + store.db.root], this._onRootChanged)
  },

  _unlistenToStore: function (store) {
    store.off(['node:' + store.db.root], this._onRootChanged)
  },

  _onRootChanged: function () {
    var db = this.state.store.db
      , title = db.nodes[db.root].content
    if (title.length > 100) {
      title = title.slice(0, 98) + '..'
      window.document.title = title
    }
    this._changeTitle(title)
  },

  _changeTitle: function (title) {
    files.update(this.state.file.id, {title: title}, file => this.setState({file: file}))
  },

  _keyDown: function (e) {
    if (!this.state.keys) return
    if (this.state.store.views[this.state.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
      return
    }
    return this.state.keys.keyDown(e)
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  onFileUpdate: function (file) {
    this.setState({file: file})
  },

  saveWindowConfig: function (windows, done) {
    var id = this.getParams().id
    files.update(id, {windows: dehydrateWindows(windows)}, done)
  },

  updateFile: function (update, done) {
    var id = this.getParams().id
    files.update(id, update, done)
  },

  _onLoad: function (file, store, plugins) {
    window.store = store
    window.docPage = this
    window.document.title = file.title
    this._listenToStore(store)

    var keys = new KeyManager()
    keys.attach(store)
    keys.addKeys({
      'g q': () => this.transitionTo('browse'),
    })

    files.update(file.id, {opened: Date.now()}, file => {
      this.setState({
        keys,
        file,
        store,
        plugins,
        loading: false,
      })
    })
  },

  loadFile: function () {
    this.setState({error: null, loading: true})
    var id = this.getParams().id

    files.find(id, file =>
      files.get(id, pl => {
        // if (err) return this._onError(err)
        files.init(file, pl, (err, store, plugins) => {
          if (err) {
            return this._onError(err)
          }
          this._onLoad(file, store, plugins)
        })
      })
    )
  },

  render: function () {
    if (this.state.loading) {
      return <div className='DocPage DocPage-loading'>Loading</div>
    }
    if (this.state.error) {
      return <em>Error loading file {this.state.error + ''}</em>
    }
    if (!this.state.store) {
      return <em>Loading</em>
    }
    var {store, file, plugins} = this.state

    return <div className='DocPage'>
      <DocHeader
        file={file}
        store={store}
        plugins={plugins}
        onFileUpdate={this.onFileUpdate}

        changeTitle={this._changeTitle}
        onClose={!this.props.noHome && (() => this.transitionTo('browse'))}
      />
      <DocViewer
        file={file}
        store={store}
        plugins={plugins}
        query={this.getQuery()}
        saveWindowConfig={this.saveWindowConfig}
        keys={this.state.keys}/>
    </div>
  },
})

module.exports = DocPage
