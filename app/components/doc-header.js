var React = require('react')
  , {Navigation, State} = require('react-router')
  , PT = React.PropTypes
  , Dupload = require('./dupload')
  , Saver = require('./saver')

var DocHeader = React.createClass({
  propTypes: {
    file: PT.object.isRequired,
    store: PT.object.isRequired,
    saver: PT.renderable,
    savingEnabled: PT.bool,
    // if not given, no "Home" button will be shown
    onClose: PT.func,
  },

  getDefaultProps: function () {
    return {
      savingEnabled: false,
    }
  },

  _keyDown: function (e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      return this._doneEditing()
    }
  },

  render: function () {
    var headStore = this.props.store.headerView()
    return <div className='DocHeader'>
      <span className='DocHeader_name'>
        <a target="_blank" href="http://notablemind.github.io">Notablemind</a>
        <a target="_blank" href="http://github.com/notablemind/notablemind">
          <i className='fa fa-github-alt'/>
        </a>
      </span>
      {!!this.props.onClose &&
        <button className='DocHeader_home' onClick={this.props.onClose}>
          Home
        </button>}
      <span className='DocHeader_title'>
        {this.props.file.title}
      </span>
      <Dupload store={this.props.store}/>
      {this.props.plugins.map(plugin =>
        plugin.view && plugin.view.global && plugin.view.global(headStore)
      )}
      <Saver
        onFileUpdate={this.props.onFileUpdate}
        store={this.props.store}
        file={this.props.file}
        value={this.props.file.source}/>
    </div>
  }
})

module.exports = DocHeader

