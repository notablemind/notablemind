/** @jsx React.DOM */

var keys = require('treed/lib/keys')

var CtrlP = module.exports = React.createClass({
  displayName: 'CtrlP',
  componentDidMount: function () {
    this._onKeyDown = keys({
      'up': this._onUp,
      'down': this._onDown,
      'escape': this._onHide,
      'return': this._onSubmit
    })
    this._onGlobalKeyDown = function (e) {
      if (e.ctrlKey && e.keyCode === 80) {
        this.setState({showing: true})
      }
    }.bind(this)
    this._cache = {}
    window.addEventListener('keydown', this._onGlobalKeyDown, true)
  },
  componentWillUnmount: function () {
    window.addEventListener('keydown', this._onGlobalKeyDown)
  },
  componentDidUpdate: function (prevProps, prevState) {
    if (this.state.showing) {
      if (!prevState.showing) {
        this.refs.input.getDOMNode().focus()
      }
    }
  },

  getDefaultProps: function () {
    return {
      height: 10
    }
  },
  getInitialState: function () {
    return {
      showing: false,
      selected: 0,
      offset: 0,
      text: ''
    }
  },

  _onUp: function () {
    var selected = this.state.selected === 0 ? 0 : this.state.selected - 1
      , off = this.state.offset
    if (off > selected) {
      off = selected
    }
    this.setState({selected: selected, offset: off})
  },
  _onDown: function () {
    var off = this.state.offset
    if (this.state.selected + 2 - off > this.props.height) {
      off  = this.state.selected + 2 - this.props.height
    }
    this.setState({
      selected: this.state.selected + 1,
      offset: off
    })
  },
  _onHide: function () {
    this.setState({
      showing: false,
      selected: 0,
      offset: 0,
      text: ''
    })
  },
  _onSubmit: function () {
    this._onHide()
    this.props.onJump(this.contents()[this.state.selected].id)
  },
  _onClick: function (id) {
    this._onHide()
    this.props.onJump(id)
  },
  _onChange: function (e) {
    this.setState({text: e.target.value, selected: 0})
  },

  contents: function () {
    if (this._cache[this.state.text]) {
      return this._cache[this.state.text]
    }
    var contents = this.props.model.search(this.state.text)
    this._cache[this.state.text] = contents
    return contents
  },

  renderContents: function () {
    var contents = this.contents()
      , selected = this.state.selected
      , off = this.state.offset
    if (!contents.length) {
      return <li>No results!</li>
    }
    return contents.slice(off + 0, off + this.props.height).map(function (item, i) {
      var cls = 'ctrlp_item'
      if (i + off === selected) {
        cls += ' selected'
      }
      return <li onClick={this._onClick.bind(null, item.id)}
                className={cls}>
        {item.text}
      </li>
    }.bind(this))
  },

  render: function () {
    if (!this.state.showing) {
      return <div className='ctrlp ctrlp--hidden'/>
    }
    return <div className='ctrlp'>
      <div className='ctrlp_back' onClick={this._onHide}/>
      <div className='ctrlp_pop'>
        <div className='ctrlp_top'>
            <input
            ref="input"
            className='ctrlp_input'
            onKeyDown={this._onKeyDown}
            onChange={this._onChange}
            value={this.state.text}/>
        </div>
        <div className='ctrlp_bottom'>
            <ul className='ctrlp_list'>
            {this.renderContents()}
            </ul>
        </div>
      </div>
    </div>
  }
});
