
var React = require('react/addons')
  , ensureInView = require('treed/util/ensure-in-view')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , KeysMixin = require('../keys-mixin')

var Tabular = React.createClass({
  propTypes: {
    items: PT.array,
    headers: PT.object,
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
        'shift+g': this.toBottom,
        'j, down': this.goDown,
        'k, up': this.goUp,
        'return': this.keySelect,
      }
    },
  },

  componentDidMount: function () {
    this.resizeHead()
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
    this.resizeHead()
    if (this.state.selected !== prevState.selected) {
      ensureInView(this.refs.selected.getDOMNode())
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
  },

  getInitialState: function () {
    return {
      selected: 0
    }
  },

  _extraKeys: function (fn) {
    fn(this.props.items[this.state.selected])
  },

  keySelect: function () {
    this.props.onSelect(this.props.items[this.state.selected])
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

  resizeHead: function () {
    // equalize the header sizes
    var table = this.refs.table.getDOMNode()
    var head = this.refs.head.getDOMNode()
      , ths = head.getElementsByTagName('th')
    ;[].map.call(table.getElementsByTagName('th'), (th, i) => {
      var cs = window.getComputedStyle(th)
      ths[i].style.width = cs.width
    })
  },

  _onMenu: function (item, i, e) {
    this.setState({selected: i})
    this.props.onMenu(item, e)
  },

  render: function () {
    var heads = Object.keys(this.props.headers)
    return <div className='Tabular'>
      <table className='Tabular_header' ref='head'>
        <thead>
          <tr>
            {
              heads.map(name => <th key={name}>{name}</th>)
            }
          </tr>
        </thead>
        <tbody/>
      </table>

      <div className='Tabular_container'>
        <table className='Tabular_table' ref='table'>
          <thead>
            <tr>
              {
                heads.map(name => <th key={name}>{name}</th>)
              }
            </tr>
          </thead>

          <tbody>
            {
              this.props.items.map((item, i) => <tr
                  key={i}
                  ref={i === this.state.selected ? 'selected' : undefined}
                  className={i === this.state.selected ? 'selected' : ''}
                  onContextMenu={this._onMenu.bind(null, item, i)}
                  onClick={this.props.onSelect.bind(null, item)}>
                {heads.map(name =>
                  <td key={name}>
                    {this.props.headers[name](item)}
                  </td>)}
              </tr>)
            }
            {!this.props.items.length &&
              <tr className='Tabular_empty'>
                <td colSpan={3}>{this.props.emptyText}</td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  },
})

module.exports = Tabular
