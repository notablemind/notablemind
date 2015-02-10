
var React = require('react/addons')
  , PT = React.PropTypes
  , cx = React.addons.classSet
  , ensureInView = require('treed/util/ensure-in-view')

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
    }
  },

  componentDidMount: function () {
    this.refs.input.getDOMNode().focus()
  },

  onChange: function (e) {
    var needle = e.target.value
    this.setState({
      needle: needle,
    })
  },

  onKeyDown: function (e) {
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      this.refs.list.handleEnter(!!e.altKey)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.refs.list.handleGoUp()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.refs.list.handleGoDown()
    }
    if (e.key === 'Escape') {
      this.props.onClose()
    }
  },

  render: function () {
    return <div className='SearchPopper'>
      <SearchBody
        ref="list"
        onSelect={this.props.onSelect}
        needle={this.state.needle}
        items={this.props.matchItems(toReg(this.state.needle))}/>
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

var SearchBody = React.createClass({
  propTypes: {
    items: PT.array,
    onSelect: PT.func,
  },

  getInitialState: function () {
    return {
      selected: 0,
    }
  },

  handleEnter: function (jump) {
    return this.props.onSelect(this.props.items[this.state.selected], jump)
  },

  handleGoUp: function () {
    if (this.state.selected < this.props.items.length - 1) {
      this.setState({selected: this.state.selected + 1})
    }
  },

  handleGoDown: function () {
    if (this.state.selected > 0) {
      this.setState({selected: this.state.selected - 1})
    }
  },

  componentWillReceiveProps: function () {
    this.setState({selected: 0})
  },

  componentDidMount: function () {
    if (!this.refs || !this.refs.selected) return;
    var node = this.refs.selected.getDOMNode();
    node.offsetParent.scrollTop = node.offsetParent.scrollHeight
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (!this.refs || !this.refs.selected) return;
    var node = this.refs.selected.getDOMNode();
    if (prevState.selected !== this.state.selected) {
      ensureInView(node);
    } else {
      node.offsetParent.scrollTop = node.offsetParent.scrollHeight
    }
  },

  render: function () {
    var items = []
    for (var i=this.props.items.length-1; i>=0; i--) {
      var item = this.props.items[i]
      items.push(
        <li className={cx({
          'SearchPopper_result': true,
          'SearchPopper_result-selected': i === this.state.selected,
        })}
          ref={i === this.state.selected ? 'selected' : undefined}
          onClick={this.props.onSelect.bind(null, item, false)}
          key={i}>
              {highlight(item.content, this.props.needle, 200)}
        </li>
      )
    }

    return <ul>
      {items}
    </ul>
  },
})

module.exports = SearchPopper
