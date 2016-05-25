
var React = require('react')
  , Tabular = require('./tabular')
  // , Dumper = require('./dumper')
  , cx = require('classnames')
  , PT = React.PropTypes
  , kernels = require('../kernels')
  , files = require('../files')
  , fuzzyTime = require('./fuzzy-time')

var Browse = React.createClass({

  propTypes: {
    onUpdated: PT.func.isRequired,
    onOpen: PT.func.isRequired,
    files: PT.array.isRequired,
    keys: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      configuring: false,
      menu: null,
    }
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (prevState.menu && !this.state.menu) {
      window.removeEventListener('mousedown', this._windowMouseDown)
    } else if (this.state.menu && !prevState.menu) {
      window.addEventListener('mousedown', this._windowMouseDown)
    }
  },

  componentWillUnmount: function () {
    window.removeEventListener('mousedown', this._windowMouseDown)
  },

  _windowMouseDown: function() {
    if (this.state.menu) this.setState({menu: null})
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  _onNewFile: function (title, repl) {
    this.setState({newing: null, error: null, loading: true})

    this.props.fileslib.create(title, repl, (file, pl) =>
      this.props.fileslib.init(file, pl, (err, store, plugins) => {
        if (err) {
          return this._onError(err)
        }
        this.props.onLoad(file, store, plugins)
      })
    )
  },

  _onMenu: function (file, e) {
    e.preventDefault()
    this.setState({menu: {file: file, x: e.pageX, y: e.pageY}})
  },

  _setRepl: function (file, repl) {
    this.props.fileslib.update(file.id, {repl: repl === 'null' ? null: repl}, () => {
      this.props.onUpdated()
    })
  },

  _openNewTab: function () {
    var id = this.state.menu.file.id
    this.setState({menu: null})
    window.open('?doc/' + id)
  },

  _exportFile: function () {
    // TODO: export file stuff
  },

  _deleteFile: function () {
    var id = this.state.menu.file.id
    this.setState({menu: null})
    this.props.fileslib.remove(id, this.props.onUpdated)
  },

  _onRemoveFile: function (file) {
    this.props.fileslib.remove(file.id, this.props.onUpdated)
  },

  _onDoneConfig: function () {
    this.setState({configuring: false})
  },

  // TODO: WORK HERE -- get this all awesome. Also remove file
  renderConfig: function (file) {
    // TODO: enable individual plugins. that would be cool.
    return <div className='Browse_config'>
      <ul className='Browse_config_repls'>
        {Object.keys(kernels).map(key =>
          <li
              onClick={this._setRepl.bind(null, file, key)}
              className={cx({
                'Browse_config_repl': true,
                'Browse_config_repl-selected': key === file.repl + '',
              })}>
            {kernels[key].title}
          </li>)}
      </ul>
      <button className='Browse_config_remove'
        onClick={this._onRemoveFile.bind(null, file)}>Remove File</button>
      <button className='Browse_config_done'
        onClick={this._onDoneConfig.bind(null, file)}>Done Config</button>
      {/* TODO: download button */}
    </div>;
  },

  _renderMenu: function () {
    var items = [
      {title: 'Open in new tab', action: this._openNewTab},
      // {title: 'Export', action: this._exportFile},
      {title: 'Delete', action: this._deleteFile},
    ]
    return <ul className='Browse_menu' style={{
      top: this.state.menu.y,
      left: this.state.menu.x,
    }}>
      {items.map((item, i) =>
          <li
              key={i}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={item.action} className='Browse_menu_item'>
            {item.title}
          </li>)}
    </ul>
  },

  render: function () {
    if (this.state.loading) {
      return <div className='Browse Browse-loading'>
        Loading...
      </div>
    }
    return <div className='Browse'>
      <Tabular
        keys={this.props.keys}
        items={this.props.files}
        onSelect={this.props.onOpen}
        emptyText="No documents"
        extraKeys={{
          'ctrl+return': item => window.open('#/doc/' + item.id)
        }}
        onMenu={this._onMenu}
        searchHeaders={['Name']}
        initialSort="Opened"
        sortHeaders={{
          'Modified': file => -file.modified || 0,
          'Opened': file => -file.opened || 0,
        }}
        headers={{
          'Name': file => file.title,
          'Repl': file => ['null', 'none'].indexOf(file.repl) === -1 ? file.repl : '',
          'Sync': file => file.source ? file.source.type : null,
          'Modified': file => file.modified ? fuzzyTime(file.modified) : null,
          'Opened': file => fuzzyTime(file.opened),
          'Size': file => file.size,
        }}
        headerWidths={{
          Repl: 100,
          Source: 100,
        }}
      />
      {/*<Dumper files={files}/>*/}
      {this.state.menu && this._renderMenu()}
    </div>
  }
})

module.exports = Browse

