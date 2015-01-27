
var React = require('treed/node_modules/react')
  , treed = require('treed/rx')

// just uses localStorage to index files, and indexeddb to store them
var localFiles = require('./files')
  , Header = require('./header')
  , Browse = require('./browse')
  , Saver = require('./saver')
  , SOURCES = require('./sources')
  , history = require('./history')
  , TypeSwitcher = require('./type-switcher')
  , KeyManager = require('treed/rx/key-manager')
  , keys = require('treed/lib/keys')
  , sync = require('./sync')

var App = React.createClass({

  getDefaultProps: function () {
    return {
      defaultType: 'tree',
      noHome: false,
      loaded: false,
      types: {
        // pdf: require('treed/rx/views/pdf'),
        tree: require('treed/rx/views/tree'),
        paper: require('treed/rx/views/paper'),
        focus: require('treed/rx/views/focus'),
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
      source: source
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


  makePaneConfig: function (store, keys, plugins, num, panings, prev) {
    if (prev.length >= num) {
      for (var i=num; i<prev.length; i++) {
        store.unregisterView(prev[i].config.view.id)
      }
      delete prev[num-1].config.view.view.windowRight
      return prev.slice(0, num)
    }
    var configs = prev.slice()
    for (var i=prev.length; i<num; i++) {
      var pane = treed.viewConfig(store, plugins, null)
      configs.push({
        type: this.props.defaultType,
        config: pane,
      })
      pane.view.on(pane.view.events.rootChanged(), this._onRebased)
      if (panings && panings.length > i) {
        pane.view.view.root = panings[i]
        pane.view.view.active = panings[i]
      }
      keys.addView(pane.view.id, pane.keys)
    }
    for (var i=0; i<configs.length; i++) {
      if (i > 0) {
        configs[i - 1].config.view.view.windowRight = configs[i].config.view.id
      }
      if (i < configs.length - 1) {
        configs[i + 1].config.view.view.windowLeft = configs[i].config.view.id
      }
    }
    return configs
  },

  _popState: function () {
    if (this.state.store) {
      this.state.store.teardown()
      this._unlistenToStore(this.state.store)
    }
    var id = history.get()
    this.setState({
      loadId: id,
      file: null,
      store: null,
      plugins: null,
    })
  },

  _changePaneType: function (i, type) {
    var panes = this.state.panes.slice()
    panes[i].type = type
    this.setState({panes: panes})
  },

  makePanes: function () {
    var plugins = []
    var panes = this.state.panes.map((pane, i) => {
      var statusbar = []
      pane.config.props.plugins.map(plugin => {
        if (!plugin.statusbar) return
        statusbar.push(plugin.statusbar(pane.config.props.store))
      })
      pane.config.props.skipMix = ['top']
      return <div className={'App_pane App_pane-' + pane.type}>
        {/* todo add filename here once we go multi-file */}
        <div className='App_pane_top'>
          {statusbar}
          <TypeSwitcher
            types={this.props.types}
            type={pane.type}
            onChange={this._changePaneType.bind(null, i)}/>
        </div>
        <div className='App_pane_scroll'>
          {this.props.types[pane.type](pane.config.props)}
        </div>
      </div>})
    var ids = []
    // TODO: this.state.store.setViewPositions(ids or something)
    return <div className='App_panes'>
      {panes}
    </div>
  },

  _setPanes: function (num) {
    var panings = this.state.file.panings ? this.state.file.panings.slice(0, num) : []
    for (var i=panings.length; i<num; i++) {
      panings.push(this.state.store.db.root)
    }
    localFiles.update(this.state.file.id, {panings: panings}, file => {
      this.setState({
        file: file,
        panes: this.makePaneConfig(this.state.store, this.state.keys, this.state.plugins, num, panings, this.state.panes),
      })
    })
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

  _clearSource: function (done) {
    localFiles.update(this.state.file.id, {source: null}, done)
  },

  _setSource: function (type, done) {
    var store = this.state.store
      , text = JSON.stringify(store.db.exportTree(), null, 2)
      , title = store.db.nodes[store.db.root].content
    SOURCES[type].saveAs(title, text, (err, config, time) => {
      if (err) return done(new Error('Failed to set source'))
      localFiles.update(this.state.file.id, {
        source: {
          type: type,
          config: config,
          synced: time,
          dirty: false,
        }
      }, file => {
        this.setState({file: file})
        done()
      })
    })
  },

  _onSync: function (done) {

    var source = this.state.file.source
      , local_modified = this.state.file.modified

    var just_save = () => {
      var store = this.state.store
        , text = JSON.stringify(store.db.exportTree(), null, 2)
        , title = store.db.nodes[store.db.root].content

      sync.just_save(title, text, source, source => {
        localFiles.update(this.state.file.id, {
          source: source
        }, file => {
          this.setState({file: file})
          done()
        })
      })
    }

    var just_update = () => {
    }

    var ss = SOURCES[source.type]

    ss.head(source.config, (last_modified, content) => {
      if (source.synced >= last_modified) {
        just_save()
      } else if (!source.dirty && local_modified <= last_modified) {
        just_update()
      } else {
        reconcile()
      }
    })

  },

  render: function () {
    if (!this.state.store) {
      return <div className='App App-browse'>
        <Browse
          keys={this.homeKeys}
          onLoad={this._onLoad}
          loadId={this.state.loadId}
          files={localFiles}/>
      </div>
    }
    return <div className='App'>
      <Header
        setPanes={this._setPanes}
        changeTitle={this._changeTitle}
        plugins={this.state.plugins}
        onClose={!this.props.noHome && this._onClose}
        file={this.state.file}
        store={this.state.store}
        saver={<Saver
          onSync={this._onSync}
          onSetup={this._setSource}
          onClear={this._clearSource}
          value={this.state.file.source}
          />}
      />
      {this.makePanes()}
    </div>
  }
})

module.exports = App


