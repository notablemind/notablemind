var React = require('react')
  , {Link, State, Navigation} = require('react-router')
  , treed = require('treed')
  , KeysMixin = require('../keys-mixin')
  , KeyManager = require('treed/key-manager')
  , TypeSwitcher = require('./type-switcher')
  , Tree = require('treed/views/tree')
  , SplitManager = require('./split-manager')
  , uuid = require('../../lib/uuid')
  , PT = React.PropTypes

function makePaneConfig(store, plugins, keys) {
  var config = treed.viewConfig(store, plugins, null)
  keys.addView(config.view.id, config.keys)
  return config
}

function hydrateWindows(windows, store, plugins, keys, windowMap) {
  var id
  if (windows.first.leaf) {
    windows.first.value.config = makePaneConfig(store, plugins, keys)
    id = uuid()
    windows.first.value.id = id
    windowMap[id] = windows.first.value
  } else {
    hydrateWindows(windows.first.value, store, plugins, keys, windowMap)
  }
  if (windows.second.leaf) {
    windows.second.value.config = makePaneConfig(store, plugins, keys)
    id = uuid()
    windows.second.value.id = id
    windowMap[id] = windows.second.value
  } else {
    hydrateWindows(windows.second.value, store, plugins, keys, windowMap)
  }
}

function hydrateInitialWindows(windows, store, plugins, keys) {
  var windowMap = {}
  if (windows.leaf) {
    var id = uuid()
    windows.value.config = makePaneConfig(store, plugins, keys)
    windows.value.id = id
    windowMap[id] = windows.value
    return windowMap
  }
  hydrateWindows(windows, store, plugins, keys, windowMap)
  return windowMap
}

var DocViewer = React.createClass({
  mixins: [KeysMixin],

  propTypes: {
    store: PT.object,
    file: PT.object,
    plugins: PT.object,
    keys: PT.object,
    viewTypes: PT.object,
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  getInitialState: function () {
    var keys = new KeyManager()
    keys.attach(this.props.store)
    keys.addKeys({
      'g q': this._onClose
    })
    var windowConfig = this.props.initialWindows
    var windowMap = hydrateInitialWindows(windowConfig, this.props.store, this.props.plugins, keys)
    return {
      windowConfig: windowConfig,
      windowMap: windowMap,
      keys: keys,
    }
  },

  getDefaultProps: function () {
    return {
      initialWindows: {
        leaf: true,
        value: {
          root: null,
          type: 'tree',
        },
      },
      viewTypes: {
        // pdf: require('treed/views/pdf'),
        tree: require('treed/views/tree'),
        paper: require('treed/views/paper'),
        focus: require('treed/views/focus'),
      }
    }
  },

  getNewWindowConfig: function (currentConfig) {
    var config = makePaneConfig(this.props.store, this.props.plugins, this.state.keys)
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

  _changeWindowConfig: function (windowConfig) {
    this.setState({windowConfig: windowConfig})
  },

  _changeViewType: function (wid, type) {
    var wmap = this.state.windowMap
    wmap[wid].type = type
    this.setState({windowMap: wmap})
  },

  _keyDown: function (e) {
    if (this.props.store.views[this.props.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
      return
    }
    return this.state.keys.keyDown(e)
  },


  componentDidMount: function () {
    // TODO: need to abstract out the logic from browse.js
    // not sure what this means now...
    window.addEventListener('keydown', this._keyDown)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this._keyDown)
  },

  /*
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
  */

  render: function () {
    var {store, file, plugins} = this.props

    return <div className='DocViewer'>
      <SplitManager
        cprops={{
          viewTypes: this.props.viewTypes,
          changeViewType: this._changeViewType,
        }}
        comp={Pane}
        config={this.state.windowConfig}
        getNew={this.getNewWindowConfig}
        onChange={this._changeWindowConfig}/>
    </div>
  }
})

var Pane = React.createClass({
  propTypes: {
    type: PT.string,
    viewTypes: PT.object,
    value: PT.object,
  },
  render: function () {
    var config = this.props.value.config
    var statusbar = []
    config.props.plugins.map(plugin => {
      if (!plugin.statusbar) return
      statusbar.push(plugin.statusbar(config.props.store))
    })
    config.props.skipMix = ['top']
    var View = this.props.viewTypes[this.props.value.type]
    return <div className={'App_pane App_pane-' + this.props.value.type}>
      <div className='App_pane_top'>
        {statusbar}
        <button onClick={this.props.onSplit.bind(null, this.props.pos, 'horiz')}>||</button>
        <button onClick={this.props.onSplit.bind(null, this.props.pos, 'vert')}> = </button>
        <button onClick={this.props.onRemove.bind(null, this.props.pos)}>x</button>
        <TypeSwitcher
          types={this.props.viewTypes}
          type={this.props.value.type}
          onChange={this.props.changeViewType.bind(null, this.props.value.id)}/>
      </div>
      <div className='App_pane_scroll'>
        <View {...config.props}/>
      </div>
    </div>
  }
})

module.exports = DocViewer
