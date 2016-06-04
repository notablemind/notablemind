
import {StyleSheet, css} from 'aphrodite'

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
    return <form className={css(styles.newFile)} onSubmit={this._onSubmit}>
      <button className={css(styles.newFileCancel)} onClick={this._onHide}>Cancel</button>
      <div>
        <h3 className={css(styles.head)}>New Document</h3>
        <input
          type="text"
          ref="input"
          onKeyDown={this._onKeyDown}
          className={css(styles.title)}
          value={this.state.title}
          onChange={this._onChange} />
        <button className={css(styles.submit)} onClick={this._onSubmit}>Create Document</button>
      </div>
      <span className='NewFile_ReplTitle'>Repl</span>
      {this.repls()}
    </form>
  },
})

const cancelButton = {
  position: 'absolute',
  top: 0,
  right: 20,
  fontSize: 16,
  backgroundColor: 'white',
  border: '1px solid #ccc',
  padding: '5px 10px',
  cursor: 'pointer',
  color: '#aaa',
  transition: 'color .2s ease, border-color .2s ease',

  ':hover': {
    borderColor: 'black',
    color: 'black',
  }
}

const styles = StyleSheet.create({
  newFile: {
    position: 'relative',
    padding: '0 20px',
  },

  newFileCancel: {
    ...cancelButton,
  },

  head: {
    margin: 0,
    display: 'none',
  },

  title: {
    fontSize: 16,
    padding: '5px 10px',
    border: '1px solid #ccc',
    width: 300,
  },

  submit: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    padding: '5px 10px',
    fontSize: 16,
    marginLeft: 5,
    cursor: 'pointer',
  },
});

module.exports = NewFile
