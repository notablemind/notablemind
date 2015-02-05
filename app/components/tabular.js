
var React = require('react/addons')
  , ensureInView = require('treed/util/ensure-in-view')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , KeysMixin = require('../keys-mixin')
  , TableBody = require('./table-body')

var Tabular = React.createClass({
  propTypes: {
    items: PT.array,
    headers: PT.object,
    sortHeaders: PT.object,
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
        '/': this.startSearch,
      }
    },
  },

  componentDidMount: function () {
    this.resizeHead()
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.resizeHead()
  },

  getInitialState: function () {
    return {
      searching: false,
      searchtext: '',
      sorting: Object.keys(this.props.headers)[0],
      sortDir: 1,
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

  startSearch: function () {
    this.setState({searching: true, searchtext: ''})
  },

  _onChangeSearch: function (e) {
    var text = e.target.value.toLowerCase()
      , heads = this.props.searchHeaders || Object.keys(this.props.headers)
      , items = text.trim() ? this.props.items.filter(item => {
          return heads.some(name => {
            var res = this.props.headers[name](item)
            return res && res.toLowerCase().indexOf(text) !== -1
          })
        }) : this.props.items
    this.setState({
      searchtext: text,
    })
  },

  _onSearchKey: function (e) {
    e.stopPropagation()
    if (e.key === 'Enter') {
      this.refs.body.keySelect()
      return e.preventDefault()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      return this.setState({searching: false, searchtext: ''})
    }
    if (e.key === 'ArrowDown') {
      this.refs.body.goDown()
      return e.preventDefault()
    }
    if (e.key === 'ArrowUp') {
      this.refs.body.goUp()
      return e.preventDefault()
    }
  },

  setSort: function (name) {
    if (this.state.sorting === name) {
      return this.setState({sortDir: -this.state.sortDir})
    }
    this.setState({sorting: name, sortDir: 1})
  },

  getItems: function () {
    if (this.state.searching) {
      return this.props.items.filter(item =>
        this.props.searchHeaders.some(head =>
          this.props.headers[head](item).toLowerCase()
            .indexOf(this.state.searchtext.toLowerCase()) !== -1))
    }
    var head = this.props.sortHeaders[this.state.sorting] || this.props.headers[this.state.sorting]
      , heads = this.props.items.map((item, i) => [head(item), i])
    heads.sort((a, b) =>
      a[0] == b[0] ? 0 :
        (a[0] > b[0] ? 1 : -1) * this.state.sortDir)
    return heads.map(head => this.props.items[head[1]])
  },

  render: function () {
    var heads = Object.keys(this.props.headers)
    return <div className='Tabular'>
      <table className='Tabular_header' ref='head'>
        <thead>
          <tr>
            {
              heads.map(name => <th
                onClick={this.setSort.bind(null, name)}
                className={this.state.sorting !== name ? null :
                  ('Tabular_sort ' + (this.state.sortDir === 1 ? '' : 'Tabular_sort-rev'))}
                key={name}>{name}</th>)
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
              this.state.searching ?
                <tr>
                  <td colSpan={heads.length}>
                    Search: <input
                      value={this.state.searchtext}
                      autoFocus={true}
                      onChange={this._onChangeSearch}
                      onKeyDown={this._onSearchKey}/>
                  </td>
                </tr> : null
            }
            {!this.props.items.length &&
              <tr className='Tabular_empty'>
                <td colSpan={3}>{this.props.emptyText}</td>
              </tr>}
          </tbody>
          <TableBody
            keys={this.props.keys}
            items={this.getItems()}
            headers={this.props.headers}
            onMenu={this.props.onMenu}
            onSelect={this.props.onSelect}
            extraKeys={this.props.extraKeys}
            ref="body"
            />
        </table>
      </div>
    </div>
  },
})

module.exports = Tabular

