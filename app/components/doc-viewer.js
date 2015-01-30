var React = require('react')
  , {Link, State, Navigation} = require('react-router')
  , treed = require('treed')
  , KeysMixin = require('../keys-mixin')
  , KeyManager = require('treed/key-manager')
  , TypeSwitcher = require('./type-switcher')
  , Tree = require('treed/views/tree')
  , PT = React.PropTypes

var DocViewer = React.createClass({
  mixins: [KeysMixin],

  propTypes: {
    store: PT.object,
    file: PT.object,
    plugins: PT.object,
    keys: PT.object,
  },

  propTypes: {
    keys: PT.object.isRequired,
    // files: PT.object.isRequired,
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  getInitialState: function () {
      var pane = treed.viewConfig(this.props.store, this.props.plugins, null)
      var keys = new KeyManager()
      keys.attach(this.props.store)
      keys.addKeys({
        'g q': this._onClose
      })
      // pane.view.on(pane.view.events.rootChanged(), this._onRebased)
      /*
      if (panings && panings.length > i) {
        pane.view.view.root = panings[i]
        pane.view.view.active = panings[i]
      }
      */
      keys.addView(pane.view.id, pane.keys)
      return {
        pane: pane,
        keys: keys,
      }
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

    var pane = this.state.pane
    var statusbar = []
    pane.props.plugins.map(plugin => {
      if (!plugin.statusbar) return
      statusbar.push(plugin.statusbar(pane.props.store))
    })
    pane.props.skipMix = ['top']

    return <div className='DocViewer'>
      <div className={'App_pane App_pane-' + pane.type}>
        <div className='App_pane_top'>
          {statusbar}
          <TypeSwitcher
            types={{} || this.props.types}
            type={pane.type}
            onChange={null && this._changePaneType.bind(null, i)}/>
        </div>
        <div className='App_pane_scroll'>
          <Tree {...pane.props}/>
        </div>
      </div>
    </div>
  }
})

module.exports = DocViewer
