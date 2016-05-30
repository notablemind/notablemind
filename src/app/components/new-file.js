
var React = require('react')
  , cx = require('classnames')
  , kernels = require('../kernels')

var repls = Object.keys(kernels)

var NewFile = React.createClass({
  getInitialState: function () {
    return {
      title: 'Untitled',
      repl: 'null',
    }
  },

  componentDidMount: function () {
    var inp = this.refs.input
    inp.focus()
    inp.selectionStart = 0
    inp.selectionEnd = inp.value.length
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
    e.stopPropagation()
    if (e.key === 'Enter') {
      return this._onSubmit(e)
    }
    if (e.key === 'Escape') {
      return this.props.onClose()
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (this.state.repl === repls[0]) {
          this.setState({repl: repls[repls.length - 1]})
        } else {
          this.setState({repl: repls[repls.indexOf(this.state.repl) - 1]})
        }
      } else {
        if (this.state.repl === repls[repls.length - 1]) {
          this.setState({repl: repls[0]})
        } else {
          this.setState({repl: repls[repls.indexOf(this.state.repl) + 1]})
        }
      }
    }
  },

  repls: function () {
    return <ul className='NewFile_repls'>
      {repls.map(key =>
        <li
            onClick={this._setRepl.bind(null, key)}
            key={key}
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
    var node = this.refs.input
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
