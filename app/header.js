
var React = require('treed/node_modules/react')
  , PT = React.PropTypes
  , Dupload = require('./dupload')

var Header = React.createClass({
  propTypes: {
    file: PT.object.isRequired,
    store: PT.object.isRequired,
    saver: PT.renderable,
    onClose: PT.func.isRequired,
    setPanes: PT.func.isRequired,
  },

  _keyDown: function (e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      return this._doneEditing()
    }
  },

  render: function () {
    var headStore = this.props.store.headerView()
    return <div className='Header'>
      <span className='Header_name'>
        <a target="_blank" href="http://notablemind.github.io">Notablemind</a>
        <a target="_blank" href="http://github.com/notablemind/notablemind">
          GH
        </a>
      </span>
      <button className='Header_home' onClick={this.props.onClose}>
        Home
      </button>
      <span className='Header_title'>
        {this.props.file.title}
      </span>
      <Dupload store={this.props.store}/>
      <button
        className="Header_pane"
        onClick={this.props.setPanes.bind(null, 1)}>
        <span className='icon-1pane'/>
      </button>
      <button
        className="Header_pane"
        onClick={this.props.setPanes.bind(null, 2)}>
        <span className='icon-2pane'/>
      </button>
      <button
        className="Header_pane"
        onClick={this.props.setPanes.bind(null, 3)}>
        <span className='icon-3pane'/>
      </button>
      {this.props.plugins.map(plugin =>
        plugin.view && plugin.view.global && plugin.view.global(headStore)
      )}
      {this.props.saver}
      {/*
      <SourceSelector
        file={this.props.file}
        onSave={this.props.onSave}
        setSource={this.props.setSource} />
        */}
    </div>
  }
})

module.exports = Header
