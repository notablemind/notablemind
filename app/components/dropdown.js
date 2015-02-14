
var React = require('react')
  , PT = React.PropTypes

var DropDown = React.createClass({
  propTypes: {
    items: PT.array,
    title: PT.node,
    onSelect: PT.func,
  },
  getInitialState: function () {
    return {open: false}
  },
  componentDidUpdate: function (prevProps, prevState) {
    if (prevState.open && !this.state.open) {
      window.removeEventListener('mousedown', this._onClose)
    } else if (!prevState.open && this.state.open) {
      window.addEventListener('mousedown', this._onClose)
    }
  },
  componentWillUnmount: function () {
    window.removeEventListener('mousedown', this._onClose)
  },
  _onClick: function (i) {
    this._onClose()
    if (this.props.items[i].action) {
      this.props.items[i].action()
    } else {
      this.props.onSelect(this.props.items[i])
    }
  },
  _onToggle: function () {
    this.setState({open: !this.state.open})
  },
  _onClose: function () {
    this.setState({open: false})
  },

  render: function () {
    var cls = this.props.className || ''
    return <div className={cls + ' DropDown'} onMouseDown={e => e.stopPropagation()}>
      <div onClick={this._onToggle} className='DropDown_title'>
        {this.props.title}
      </div>
      {this.state.open && <ul className='DropDown_list'>
        {this.props.items.map((item, i) =>
        !!item && (
        item.disabled ?
          <li key={i} className='DropDown_item DropDown_item-disabled'>{item.title || item}</li> :
          <li key={i} onClick={this._onClick.bind(null, i)} className='DropDown_item'>{item.title || item}</li>
        ))}
      </ul>}
    </div>
  },
})

module.exports = DropDown

