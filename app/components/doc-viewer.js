var React = require('react')
  , {Link, State, Navigation} = require('react-router')
  , Treed = require('treed/classy')
  , KeysMixin = require('../keys-mixin')
  , TypeSwitcher = require('./type-switcher')
  , SplitManager = require('./split-manager')
  , SearchPopper = require('./search-popper')
  , KeyboardHelper = require('./keyboard-helper')
  , uuid = require('../../lib/uuid')
  , PT = React.PropTypes
  , windowJump = require('./window-jump')

function windowPos(windows, fn, pos) {
  pos = pos || []
  if (windows.leaf) {
    if (fn(windows.value)) return pos
    return
  }
  var first = windowPos(windows.value.first, fn, pos.concat(['first']))
  if (first) return first
  var second = windowPos(windows.value.second, fn, pos.concat(['second']))
  if (second) return second
}

function hydrateWindows(windows, treed, windowMap, viewTypes) {
  var id, view
  if (windows.first.leaf) {
    view = viewTypes[windows.first.value.type || 'list'] || viewTypes.list
    windows.first.value.config = treed.addView({
      root: windows.first.value.root,
      actions: view.actions,
      keys: view.keys,
    })
    id = uuid()
    windows.first.value.id = id
    windowMap[id] = windows.first.value
  } else {
    hydrateWindows(windows.first.value, treed, windowMap, viewTypes)
  }
  if (windows.second.leaf) {
    view = viewTypes[windows.second.value.type || 'list'] || viewTypes.list
    windows.second.value.config = treed.addView({
      root: windows.second.value.root,
      actions: view.actions,
      keys: view.keys,
    })
    id = uuid()
    windows.second.value.id = id
    windowMap[id] = windows.second.value
  } else {
    hydrateWindows(windows.second.value, treed, windowMap, viewTypes)
  }
}

function hydrateInitialWindows(windows, treed, viewTypes) {
  var windowMap = {}
  if (windows.leaf) {
    var id = uuid()
      , view = viewTypes[windows.value.type || 'list'] || viewTypes.list
    windows.value.config = treed.addView({
      root: windows.value.root,
      actions: view.actions,
      keys: view.keys,
    })
    windows.value.id = id
    windowMap[id] = windows.value
    return windowMap
  }
  hydrateWindows(windows.value, treed, windowMap, viewTypes)
  return windowMap
}

var DocViewer = React.createClass({
  mixins: [KeysMixin],

  statics: {
    keys: function () {
      return {
        'w l, w right': this._windowJump.bind(null, 'right'),
        'w j, w down': this._windowJump.bind(null, 'down'),
        'w k, w up': this._windowJump.bind(null, 'up'),
        'w h, w left': this._windowJump.bind(null, 'left'),
        'shift+; v s': this._split.bind(null, 'horiz'),
        'shift+; s p': this._split.bind(null, 'vert'),
        'shift+; q': this._remove,
        '/': this._startSearching,
      }
    },
  },

  propTypes: {
    treed: PT.object,
    file: PT.object,
    keys: PT.object,
    viewTypes: PT.object,
    saveWindowConfig: PT.func,
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  getInitialState: function () {
    var windowConfig = this.props.file.windows || {
      leaf: true,
      ratio: .5,
      value: {
        root: null,
        type: 'list',
      },
    }
    var windowMap = hydrateInitialWindows(windowConfig, this.props.treed, this.props.viewTypes)
    return {
      windowConfig: windowConfig,
      windowMap: windowMap,
      searching: false,
    }
  },

  getDefaultProps: function () {
    return {
      viewTypes: {
        // pdf: require('treed/views/pdf'),
        list: require('treed/views/list'),
        mindmap: require('treed/views/mindmap'),
        paper: require('treed/views/paper'),
        focus: require('treed/views/focus'),
      }
    }
  },

  findCurrentPane: function () {
    var vid = this.props.treed.store.activeView
    return windowPos(this.state.windowConfig, (value) => value.config.store.view.id === vid)
  },

  _split: function (orient) {
    var config = SplitManager.split(this.findCurrentPane(), orient, this.state.windowConfig, this.getNewWindowConfig)
    this._changeWindowConfig(config)
  },

  _remove: function () {
    var result = SplitManager.remove(this.findCurrentPane(), this.state.windowConfig)
    if (!result) return
    this._onRemovedWindow(result.removed)
    this._changeWindowConfig(result.config)
  },

  _windowJump: function (direction) {
    var currentView = this.props.treed.store.activeView
    if (this.props.treed.store.views[currentView].mode === 'insert') return true
    var nextId = windowJump(this.state.windowConfig, currentView, direction)
    if (false === nextId) return
    this.props.treed.store.activeView = nextId
    this.props.treed.store.changed(this.props.treed.store.events.activeViewChanged())
  },

  getNewWindowConfig: function (currentConfig) {

    var view = this.props.viewTypes[currentConfig.type || 'list'] || this.props.viewTypes.list
    var config = this.props.treed.addView({
        root: currentConfig.root,
        actions: view.actions,
        keys: view.keys,
      })
      , id = uuid()
      , value = {
          config: config,
          type: currentConfig.type,
          id: id,
          root: currentConfig.root
        }
    this.state.windowMap[id] = value
    return value
  },

  _onRemovedWindow: function (window) {
    var id = window.config.store.view.id
    this.props.treed.store.unregisterView(id)
  },

  _changeWindowConfig: function (windowConfig) {
    this.props.saveWindowConfig(windowConfig, () =>
      this.setState({windowConfig: windowConfig}))
  },

  _rebaseView: function (wid, root) {
    var wmap = this.state.windowMap
    wmap[wid].root = root
    this.props.saveWindowConfig(this.state.windowConfig)
  },

  _changeViewType: function (wid, type) {
    var wmap = this.state.windowMap
      , view = this.props.viewTypes[type || 'list'] || this.props.viewTypes.list
      , isActive = this.props.treed.store.activeView === wmap[wid].config.store.id
    this.props.treed.removeView(wmap[wid].config.id)

    wmap[wid].type = type || 'list'
    var config = wmap[wid].config = this.props.treed.addView({
      root: wmap[wid].root,
      actions: view.actions,
      keys: view.keys,
    })

    if (isActive) {
      config.store.actions.setActiveView()
    }

    this.setState({windowMap: wmap})
    this.props.saveWindowConfig(this.state.windowConfig, () => null)
  },

  componentDidMount: function () {
    // TODO: need to abstract out the logic from browse.js
    // not sure what this means now...
    window.addEventListener('keydown', this._keyDown)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this._keyDown)
  },

  _startSearching: function (e) {
    if (this.props.treed.store.views[this.props.treed.store.activeView].mode === 'insert') return true
    this.setState({searching: true})
  },

  _searchItems: function (needle) {
    var store = this.props.treed.store
      , blackTypes = ['ipython', 'code-playground'] // TODO have plugins declare this, as "nosearch" or something
      , view = store.views[store.activeView]
      , root = view.root
      , db = store.db

    var frontier = [root]
      , found = []
    while (frontier.length && found.length < 20) {
      var next = db.nodes[frontier.shift()]
      if (next.content.trim().length && blackTypes.indexOf(next.type) === -1 && (!needle || next.content.match(needle))) {
        found.push(next)
      }
      if (next.children) {
        frontier = frontier.concat(next.children)
      }
    }
    return found
  },

  _onSearchSelect: function (item, jump) {
    var actions = this.props.treed.store.currentViewActions()
    // TODO think about what should be the default behavior. Should it be to
    // rebase, or to scroll + open?
    if (jump) {
      actions.rebase(item.id)
    } else {
      actions.expandToAndSelect(item.id)
    }
    this.setState({searching: false})
  },

  _canGrabKeyboard: function (e) {
    return (this.props.treed.store.views[this.props.treed.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) === -1)
  },

  render: function () {
    var {treed, file, plugins} = this.props

    return <div className='DocViewer'>
      <SplitManager
        cprops={{
          viewTypes: this.props.viewTypes,
          changeViewType: this._changeViewType,
          onRebase: this._rebaseView,
        }}
        comp={Pane}
        config={this.state.windowConfig}
        getNew={this.getNewWindowConfig}
        onRemove={this._onRemovedWindow}
        onChange={this._changeWindowConfig}/>
      {this.state.searching && <SearchPopper
        matchItems={this._searchItems}
        onClose={() => this.setState({searching: false})}
        onSelect={this._onSearchSelect} />}
      <KeyboardHelper canGrabKeyboard={this._canGrabKeyboard} keys={this.props.keys} plugins={this.props.treed.options.plugins}/>
    </div>
  }
})

var Pane = React.createClass({
  propTypes: {
    type: PT.string,
    viewTypes: PT.object,
    value: PT.object,
  },
  _onRebase: function () {
    var store = this.props.value.config.store
    this.props.onRebase(this.props.value.id, store.view.root)
  },
  componentDidMount: function () {
    var view = this.props.value.config.store
    view.on(view.events.rootChanged(), this._onRebase)
  },
  componentWillUnmount: function () {
    var view = this.props.value.config.store
    view.on(view.events.rootChanged(), this._onRebase)
  },
  render: function () {
    var props = this.props.value.config
    var statusbar = []
    props.plugins.map(plugin => {
      if (!plugin.statusbar) return
      statusbar.push(plugin.statusbar(props.store))
    })
    props.skipMix = ['top']
    var View = this.props.viewTypes[this.props.value.type]
    if (!View) {
      View = this.props.viewTypes.list
    }
    return <div className={'App_pane App_pane-' + this.props.value.type}>
      <div className='App_pane_top'>
        {statusbar}
        <div className='App_pane_splitters'>
          <button onClick={this.props.onSplit.bind(null, this.props.pos, 'horiz')}>||</button>
          <button onClick={this.props.onSplit.bind(null, this.props.pos, 'vert')}> = </button>
          <button onClick={this.props.onRemove.bind(null, this.props.pos)}>x</button>
        </div>
        <TypeSwitcher
          types={this.props.viewTypes}
          type={this.props.value.type}
          onChange={this.props.changeViewType.bind(null, this.props.value.id)}/>
      </div>
      <div className='App_pane_scroll'>
        <View {...props}/>
      </div>
    </div>
  }
})

module.exports = DocViewer
