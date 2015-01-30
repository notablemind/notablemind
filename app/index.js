
var React = require('react')
  , treed = require('treed')

// just uses localStorage to index files, and indexeddb to store them
var localFiles = require('./files')
  , Header = require('./header')
  , Browse = require('./browse')
  , Saver = require('./saver')
  , SOURCES = require('./sources')
  , history = require('./history')
  , TypeSwitcher = require('./type-switcher')
  , KeyManager = require('treed/key-manager')
  , keys = require('treed/lib/keys')
  , sync = require('./sync')

var App = React.createClass({

  getDefaultProps: function () {
    return {
      defaultType: 'tree',
      noHome: false,
      loaded: false,
      types: {
        // pdf: require('treed/views/pdf'),
        tree: require('treed/views/tree'),
        paper: require('treed/views/paper'),
        focus: require('treed/views/focus'),
      }
    }
  },

  getInitialState: function () {
    return {
      loadId: history.get(),
      file: null,
      store: null,
      plugins: null,
      panes: [],
    }
  },

  componentWillMount: function () {
    window.document.title = 'Notablemind:list'
    this.homeKeys = keys({})
  },

  componentDidMount: function () {
    // TODO: need to abstract out the logic from browse.js
    window.addEventListener('popstate', this._popState)
    window.addEventListener('keydown', this._keyDown)
  },

  componentDidUpdate: function () {
    if (!this.state.store) return
    this.state.store.changed(this.state.store.events.activeViewChanged())
  },

  _keyDown: function (e) {
    if (!this.state.store) {
      if (['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
        return
      }
      return this.homeKeys(e)
    }
    if (this.state.store.views[this.state.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
      return
    }
    return this.state.keys.keyDown(e)
  },

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
    localFiles.update(this.state.file.id, {
      source: source,
      modified: this.state.file.modified,
    }, file => this.setState({file: file}))
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

  _changePaneType: function (i, type) {
    var panes = this.state.panes.slice()
    panes[i].type = type
    this.setState({panes: panes})
  },

  _onRebased: function () {
    var panings = Object.keys(this.state.store.views).map(vid => this.state.store.views[vid].root)
    localFiles.update(this.state.file.id, {panings: panings}, file => {
      this.setState({file: file})
    })
  },

  _onLoad: function (file, store, plugins) {
    window.store = store
    history.set(file.id)
    store.clearViews()
    this._listenToStore(store)
    window.document.title = file.title
    var keys = new KeyManager()
    keys.attach(store)
    keys.addKeys({
      'g q': this._onClose
    })
    this.setState({
      loadId: null,
      file,
      store,
      keys,
      plugins,
      panes: this.makePaneConfig(store, keys, plugins, file.panings ? file.panings.length : 1, file.panings || [], []),
    })
  },

  _onClose: function () {
    history.set('')
    window.document.title = 'Notablemind:list'
    if (this.state.store) {
      this.state.store.teardown()
      this._unlistenToStore(this.state.store)
    }
    this.setState({
      loadId: null,
      file: null,
      store: null,
      plugins: null
    })
  },

  _changeTitle: function (title) {
    localFiles.update(this.state.file.id, {title: title}, file => this.setState({file: file}))
  },

  render: function () {
  }
})

module.exports = App


