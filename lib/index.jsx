/** @jsx React.DOM */

var HelloPage = require('./hello.jsx')
  , MainApp = require('./main')
  , Header = require('./header.jsx')

  , Model = require('treed/skins/workflowy/model')
  , Controller = require('treed/skins/workflowy/controller')

  , moveTween = require('./move-tween')

  , loadModel = require('./load-model')
  , VIEW_TYPES = require('./view-types')

var NotableMind = module.exports = React.createClass({
  displayName: 'NotableMind',
  getDefaultProps: function () {
    return {
      initialBack: null,
      backs: null
    }
  },

  getInitialState: function () {
    return {
      backType: null,
      loadingModel: false,
      model: null,
      viewType: 'workflowy',
      nm: null
    }
  },

  componentDidMount: function () {
    if (!this.props.initialBack) {
      return
    }
    this._sizeBox = this.getDOMNode().getBoundingClientRect()
    console.log(this._sizeBox)
    var b = this.props.initialBack
    this.onChangeBack(b.back, b.type)
  },

  onChangeBack: function (back, backType) {
    this.setState({
      loadingModel: true,
      backType: backType
    })

    loadModel(back, Model, function (err, model) {
      if (err) {
        return this.setState({
          loadingModel: false,
          modelError: err,
          model: null,
          nm: null
        })
      }

      var nm = window.controller = new Controller(model)
      var view = window.view = nm.setView(
        VIEW_TYPES[this.state.viewType].cls,
        VIEW_TYPES[this.state.viewType].options
      );

      this.setState({
        loadingModel: false,
        modelError: null,
        model: model,
        view: view,
        nm: nm
      })
    }.bind(this))
  },

  getDataDump: function () {
    return this.state.nm.exportData()
  },

  _onChangeViewType: function (type) {
    var view = window.view = this.state.nm.setView(
      VIEW_TYPES[type].cls,
      VIEW_TYPES[type].options
    )
    this._sizeBox = this.getDOMNode().getBoundingClientRect()
    this.setState({
      viewType: type,
      view: view
    });
  },

  _onLogout: function () {
    if (this.state.nm) {
      // this.state.nm.destroy()
    }
    this.setState({nm: null, backType: null})
    localStorage._notablemind_backend = null
  },

  _onClickImport: function () {
    this.setState({
      importing: true
    })
  },

  // filename: string
  // data: look at model.importData for more info
  // options:
  // - not sure about options just yet.
  _onLoadImport: function (filename, data, options) {

    var now = new Date()
      , content = 'Imported on ' + now.toLocaleDateString() +
               ' at ' + now.toLocaleTimeString() +
               ' from ' + filename

    this.state.nm.importData({
      meta: {
        done: false
      },
      content: content,
      collapsed: false,
      children: [data]
    })
  },

  componentDidUpdate: function (prevProps, prevState) {
    var oldBox = this._sizeBox
      , node = this.getDOMNode()
    if (prevState.loadingModel && !this.state.loadingModel) {
      this._sizeBox = node.getBoundingClientRect()
    }
    if (prevState.viewType === this.state.viewType) {
      return
    }
    this._sizeBox = node.getBoundingClientRect()
    moveTween(oldBox, this._sizeBox, node, function () {
      this._sizeBox = node.getBoundingClientRect()
    }.bind(this))
  },

  render: function () {
    if (this.state.loadingModel) {
      return (
        <div className='notablemind'>
          Loading...
        </div>
      )
    }
    if (!this.state.nm) {
      if (!this.props.backs) {
        return <div/>
      }
      return (
        <div className='notablemind'>
          <HelloPage onReady={this.onChangeBack} backs={this.props.backs}/>
        </div>
      )
    }

    return (
      <div className={'notablemind notablemind--' + this.state.viewType}>
        <Header back={this.state.nm.model.db}
          backType={this.state.backType}
          backs={this.props.backs}
          viewType={this.state.viewType}
          onLogout={this.props.backs && this._onLogout}
          onImport={this._onLoadImport}
          onChangeViewType={this._onChangeViewType}
          getDataDump={this.getDataDump}/>
        <MainApp
            ref="app"
            model={this.state.model}
            view={this.state.view}
            nm={this.state.nm}/>
      </div>
    )
  }
})

// vim: set tabstop=2 shiftwidth=2 expandtab:

