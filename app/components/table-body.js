
var React = require('react/addons')
  , ensureInView = require('treed/util/ensure-in-view')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , KeysMixin = require('../keys-mixin')

function arEq(a, b) {
  if (a.length !== b.length) return false
  for (var i=0; i<a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

var TableBody = React.createClass({
  propTypes: {
    items: PT.array,
    headers: PT.object,
    searchHeaders: PT.array,
    onSelect: PT.func,
    keys: PT.func,
    emptyText: PT.node,
    extraKeys: PT.object,
  },

  mixins: [KeysMixin],

  statics: {
    keys: function () {
      return {
        'g g': this.toTop,
        'shift+[': this.toTop,
        'shift+g': this.toBottom,
        'shift+]': this.toBottom,
        'j, down': this.goDown,
        'k, up': this.goUp,
        'return': this.keySelect,
      }
    }
  },

  componentDidMount: function () {
    if (this.props.extraKeys) {
      var k = {}
      for (var name in this.props.extraKeys) {
        k[name] = this._extraKeys.bind(null, this.props.extraKeys[name])
      }
      this._extra_keys = this.props.keys.add(k)
    }
  },

  componentWillUnmount: function () {
    if (this._extra_keys) {
      this.props.keys.remove(this._extra_keys)
      delete this._extra_keys
    }
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (this.state.selected !== prevState.selected) {
      this.refs.selected && ensureInView(this.refs.selected.getDOMNode())
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (this._extra_keys && nextProps.keys) {
      nextProps.keys.remove(this._extra_keys)
      delete this._extra_keys
    }
    if (nextProps.extraKeys) {
      var k = {}
      for (var name in nextProps.extraKeys) {
        k[name] = this._extraKeys.bind(null, nextProps.extraKeys[name])
      }
      this._extra_keys = nextProps.keys.add(k)
    }
    if (this.state.selected >= nextProps.items.length) {
      if (nextProps.items.length === 0) {
        this.setState({selected: 0})
      } else {
        this.setState({selected: nextProps.items.length - 1})
      }
    }
  },

  getInitialState: function () {
    return {
      selected: 0,
    }
  },

  _extraKeys: function (fn) {
    fn(this.props.items[this.state.selected])
  },

  keySelect: function () {
    var item = this.props.items[this.state.selected]
    if (!item) return
    this.props.onSelect(item)
  },

  toTop: function () {
    this.setState({selected: 0})
  },

  toBottom: function () {
    this.setState({selected: this.props.items.length - 1})
  },

  goUp: function () {
    if (this.state.selected > 0) {
      this.setState({selected: this.state.selected - 1})
    }
  },

  goDown: function () {
    if (this.state.selected < this.props.items.length - 1) {
      this.setState({selected: this.state.selected + 1})
    }
  },

  _onMenu: function (item, i, e) {
    this.setState({selected: i})
    this.props.onMenu(item, e)
  },

  render: function () {
    var heads = Object.keys(this.props.headers)
    return <tbody>
      {this.props.items
          .map((item, i) => <tr
            key={i}
            ref={i === this.state.selected ? 'selected' : undefined}
            className={i === this.state.selected ? 'selected' : ''}
            onContextMenu={this._onMenu.bind(null, item, i)}
            onClick={this.props.onSelect.bind(null, item)}>
          {heads.map(name =>
            <td key={name}>
              {this.props.headers[name](item)}
            </td>)}
        </tr>)}
    </tbody>
  },
})

module.exports = TableBody
