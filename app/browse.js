
var React = require('treed/node_modules/react')
  , NewFile = require('./new-file')
  , Dropload = require('./dropload')
  , Importer = require('./importer')
  , Tabular = require('./tabular')
  , Dumper = require('./dumper')
  , readFile = require('./read-file')
  , treed = require('treed/rx')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , history = require('./history')
  , kernels = require('./kernels')
  , async = require('async')

function strcmp(a, b) {
  if (a === b) return 0
  if (a > b) return 1
  return -1
}

var Browse = React.createClass({
  propTypes: {
    loadId: PT.string,
    files: PT.object.isRequired,
    onLoad: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      configuring: false,
      loading: true,
      error: null,
      files: null,
      newing: null,
    }
  },

  componentDidUpdate: function (prevProps) {
    if (!prevProps.loadId && this.props.loadId) {
      this.state.files.some(file => {
        if (file.id !== this.props.loadId) return false
        this.setState({
          error: null,
          loading: true
        })
        this.loadFile(file, true)
        return true
      })
    }
  },

  loadFiles: function () {
    this.props.files.list(files => {
      // var id = history.get()
      if (this.props.loadId) {
        var found = files.some(file => {
          if (file.id !== this.props.loadId) return false
          this.setState({
            error: null,
            files: files,
            loading: true
          })
          this.loadFile(file, true)
          return true
        })
        if (found) {
          return
        }
      }
      // sort by title
      files = files.sort((a, b) => strcmp(a.title, b.title))
      this.setState({files, loading: false})
    })
  },

  componentDidMount: function () {
    if (this.state.file) return
    this.loadFiles()
    window.addEventListener('mousedown', this._windowMouseDown)
    if (this.props.keys) {
      this.props.keys.add({
        'n': () => this.setState({newing: 'new'}),
      })
    }
  },

  componentWillUnmount: function () {
    window.removeEventListener('mousedown', this._windowMouseDown)
  },

  loadFile: function (file, autoload) {
    if (!autoload) {
      history.set(file.id)
    }
    this.setState({error: null, loading: true})

    this.props.files.get(file.id, pl =>
      this.props.files.init(file, pl, (err, store, plugins) => {
        if (err) {
          return this._onError(err)
        }
        this.props.files.update(file.id, {opened: Date.now()}, file => {
          this.props.onLoad(file, store, plugins)
        })
      })
    )
  },

  _windowMouseDown: function() {
    if (this.state.menu) this.setState({menu: null})
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  _onNewFile: function (title, repl) {
    this.setState({newing: null, error: null, loading: true})

    this.props.files.create(title, repl, (file, pl) =>
      this.props.files.init(file, pl, (err, store, plugins) => {
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
    this.props.files.update(file.id, {repl: repl === 'null' ? null: repl}, () => {
      this.loadFiles()
    })
  },

  _openNewTab: function () {
    var id = this.state.menu.file.id
    this.setState({menu: null})
    window.open('?' + id)
  },

  _exportFile: function () {
    // TODO: export file stuff
  },

  _deleteFile: function () {
    var id = this.state.menu.file.id
    this.setState({menu: null})
    this.props.files.remove(id, this.loadFiles)
  },

  _onRemoveFile: function (file) {
    this.props.files.remove(file.id, this.loadFiles)
  },

  _onDoneConfig: function () {
    this.setState({configuring: false})
  },

  _onImport: function (files) {
    if (!files.length) return console.warn('no files');
    // TODO what about multiple files?
    var reader = readFile(files[0], (err, text) => {
      if (err) {
        return this.setState({
          newing: null,
          importError: err.message,
          importing: false,
        })
      }
      this.setState({importError: null, importing: false})
      this.props.files.importRaw(text, err => {
        if (err) {
          return this.setState({
            newing: null,
            importError: err.message,
            importing: false,
          })
        }
        this.loadFiles()
      })
    })
    this.setState({
      newing: null,
      importing: reader,
      importError: false,
    })
  },

  _onSourced: function (data, source) {
    if ('string' === typeof data) {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return console.warn('failed to import file')
      }
    }
    this.props.files.importRaw(data, (err, file) => {
      this.props.files.update(file.id, {source: source}, (err) => {
        this.loadFiles()
      })
    })
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

  _onNewOpen: function (what, open) {
    this.setState({newing: open ? what : null})
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
      {this.state.error && 'Error loading file!'}
      <div className={
        'Browse_news' + (this.state.newing ? 'Browse_news-open' : '')
      }>
        {this.state.newing !== 'import' &&
          <NewFile onSubmit={this._onNewFile}
            open={this.state.newing == 'new'}
            onOpen={this._onNewOpen.bind(null, 'new')}/>}
        {!this.state.newing &&
          <h1 className='Browse_title'>Notablemind</h1>}
        {this.state.newing !== 'new' &&
          <Importer onSourced={this._onSourced}
            open={this.state.newing == 'import'}
            onOpen={this._onNewOpen.bind(null, 'import')}/>}
      </div>
      <Dropload onDrop={this._onImport} message="Drop anywhere to import"/>
      {this.state.importError && 'Import Error: ' + this.state.importError}

      <Tabular
        keys={this.props.keys}
        items={this.state.files}
        onSelect={this.loadFile}
        extraKeys={{
          'ctrl+return': item => window.open('?' + item.id)
        }}
        onMenu={this._onMenu}
        headers={{
          'Name': file => file.title,
          'Repl': file => file.repl,
          'Source': file => file.source ? file.source.type : null,
        }}
        headerWidths={{
          Repl: 100,
          Source: 100,
        }}
      />
      {/*<Dumper files={this.props.files}/>*/}
      {this.state.menu && this._renderMenu()}
    </div>
  }
})

module.exports = Browse

