
var React = require('react/addons')
  , PT = React.PropTypes
  , cx = React.addons.classSet

function toReg(needle) {
  return new RegExp(needle
    .replace('.', '\\.')
    .replace('*', '.*?'), 'gi');
}

function highlight(text, needle, maxSize) {
	var rx = toReg(needle)

  var items = []
  var last = 0
  text.replace(rx, (matched, pos, full) => {
    items.push(full.slice(last, pos))
    items.push(<strong>{matched}</strong>)
    last = pos + matched.length
  })
  items.push(text.slice(last))
  if (text.length > maxSize) {
    var ln = 0
    if (items[0].length > maxSize/2) {
      items[0] = items[0].slice(-maxSize/2)
    }
    ln = items[0].length
    for (var i=2; i<items.length; i+=2) {
      if (ln + items[i].length > maxSize) {
        items[i] = items[i].slice(maxSize - ln)
        return items.slice(0, i+1)
      }
      ln += items[i].length
    }
  }
  return items
}

var SearchPopper = React.createClass({
  propTypes: {
    matchItems: PT.func.isRequired,
    onSelect: PT.func.isRequired,
    onClose: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      needle: '',
      items: this.props.matchItems(),
    }
  },

  componentDidMount: function () {
    this.refs.input.getDOMNode().focus()
  },

  onChange: function (e) {
    var needle = e.target.value
    this.setState({
      needle: needle,
      items: this.props.matchItems(toReg(needle))
    })
  },

  onKeyDown: function (e) {
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      // TODO visually indicate in the UI that pressing the Alt key will
      // trigger a rebase
      return this.props.onSelect(this.state.items[0], !!e.altKey);
    }
    if (e.key === 'Escape') {
      this.props.onClose()
    }
  },

  render: function () {
    var items = []
    for (var i=this.state.items.length-1; i>=0; i--) {
      var item = this.state.items[i]
      items.push(
        <li className={cx({
          'SearchPopper_result': true,
          // 'SearchPopper_result-selected': i === this.state.selected,
        })} key={i}>
              {highlight(item.content, this.state.needle, 200)}
        </li>
      )
    }

    return <div className='SearchPopper'>
      <ul>
        {items}
      </ul>
      <div className='SearchPopper_input'>
        <input
          ref="input"
          autoFocus={true}
          value={this.state.needle}
          placeholder="search"
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}/>
      </div>
    </div>
  }
})

module.exports = SearchPopper
