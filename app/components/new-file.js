
var React = require('react/addons')
  , cx = React.addons.classSet
  , kernels = require('../kernels')
  , KeysMixin = require('../keys-mixin')

var NewFile = React.createClass({
  getInitialState: function () {
    return {
      title: 'Untitled',
      repl: 'null',
    }
  },

  _onChange: function (e) {
    this.setState({title: e.target.value})
  },
  _setRepl: function (key) {
    this.setState({repl: key})
  },
  _onSubmit: function (e) {
    e.preventDefault()
    e.stopPropagation()
    this.props.onSubmit(this.state.title, this.state.repl)
  },
  _onKeyDown: function (e) {
    if (e.key === 'Return') {
      return this._onSubmit(e)
    }
  },

  repls: function () {
    return <ul className='NewFile_repls'>
      {Object.keys(kernels).map(key =>
        <li
            onClick={this._setRepl.bind(null, key)}
            className={cx({
              'NewFile_repl': true,
              'NewFile_repl-selected': key === this.state.repl,
            })}>
          {kernels[key].title}
        </li>)}
    </ul>
  },

  _onHide: function (e) {
    e.preventDefault()
    this.props.onClose()
  },

  componentDidUpdate: function (prevProps) {
    if (!this.props.open || prevProps.open) return
    var node = this.refs.input.getDOMNode()
    node.focus()
    node.selectionStart = 0
    node.selectionEnd = node.value.length
  },

  render: function () {
    return <form className="NewFile" onSubmit={this._onSubmit}>
      <button className='NewFile_cancel' onClick={this._onHide}>Cancel</button>
      <div>
        <h3 className="NewFile_head">New Document</h3>
        <input
          autoFocus={true}
          type="text"
          ref="input"
          onKeyDown={this._onKeyDown}
          className='NewFile_title'
          value={this.state.title}
          onChange={this._onChange} />
        <button className='NewFile_submit' onClick={this._onSubmit}>Create Document</button>
      </div>
      <span className='NewFile_ReplTitle'>Repl</span>
      {this.repls()}
    </form>
  },
})

module.exports = NewFile
