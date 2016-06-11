
import {StyleSheet, css} from 'aphrodite'

var React = require('react')
  , Tabular = require('./tabular')
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
    return <div>
      <ul className={css(styles.Browse_config_repls)}>
        {Object.keys(kernels).map(key =>
          <li
            onClick={this._setRepl.bind(null, file, key)}
            className={css(
              styles.Browse_config_repl,
                key === file.repl + '' &&
                  styles.Browse_config_repl_selected
            )}
          >
            {kernels[key].title}
          </li>)}
      </ul>
      <button onClick={this._onRemoveFile.bind(null, file)}>
        Remove File
      </button>
      <button onClick={this._onDoneConfig.bind(null, file)}>
        Done Config
      </button>
      {/* TODO: download button */}
    </div>;
  },

  _renderMenu: function () {
    var items = [
      {title: 'Open in new tab', action: this._openNewTab},
      // {title: 'Export', action: this._exportFile},
      {title: 'Delete', action: this._deleteFile},
    ]
    return <ul className={css(styles.Browse_menu)} style={{
      top: this.state.menu.y,
      left: this.state.menu.x,
    }}>
      {items.map((item, i) =>
          <li
              key={i}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={item.action} className={css(styles.Browse_menu_item)}>
            {item.title}
          </li>)}
    </ul>
  },

  render: function () {
    if (this.state.loading) {
      return <div className={css(styles.Browse, styles.Browse_loading)}>
        Loading...
      </div>
    }
    return <div className={css(styles.Browse)}>
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
        initialSort="Modified"
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

const styles = StyleSheet.create({
  Tabular: {
    flex: 1,
  },

  Browse: {
    display: 'flex',
    flex: 1,
  },

  Browse_new_btn: {
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '1px solid white',
    transition: 'border-color .2s ease, color .2s ease',

    flex: 1,
    marginBottom: 10,
    margin: '0 20px 5px',
    color: '#aaa',
    borderColor: '#eee',

    ':hover': {
      borderColor: '#777',
      color: 'black',
    },
  },

  Browse_new_cancel: {
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
    },
  },

  BrowseHeader_opener: {
    display: 'flex',
    flexDirection: 'row',
  },

  BrowseHeader_opener_open: {
    display: 'block',
  },

  Browse_loading: {
    textAlign: 'center',
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 0 15px #888',
    margin: '200px auto',
    boxShadow: 'none',
  },

  Browse_head: {
    textAlign: 'center',
    marginTop: 0,
  },

  Browse_files: {
    padding: 0,
    margin: '20px 0 0',
    listStyle: 'none',
    overflow: 'auto',
    flex: 1,
  },

  Browse_file: {
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 16,

    ':hover': {
      backgroundColor: '#eee',
    },
  },

  Browse_nofiles: {
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 16,
    color: '#999',
  },

  Browse_source: {
    float: 'right',
  },

  Browse_repl: {
    float: 'right',
  },

  Browse_repl_null: {
    display: 'none',
  },

  Browse_config_repls: {
    padding: 0,
    margin: '10px 0',
    listStyle: 'none',
  },

  Browse_config_repl: {
    padding: '5px 10px',
    border: '1px solid transparent',
    display: 'inline-block',
    cursor: 'pointer',

    ':hover': {
      backgroundColor: '#eee',
    },
  },

  Browse_config_repl_selected: {
    borderColor: '#aaa',
  },

  Modal: {
    zIndex: 10011,
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 200,
    margin: '-100px 0 0 -150px',
    border: '1px solid #eee',
    boxShadow: '0 0 10px black',
    padding: 10,
    background: 'white',
  },

  Browse_menu: {
    position: 'absolute',
    cursor: 'pointer',
    backgroundColor: '#fff',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    boxShadow: '0 0 5px black',
  },

  Browse_menu_item: {
    padding: '7px 13px',

    ':hover': {
      backgroundColor: '#eee',
    },
  },
})
