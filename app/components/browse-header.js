var React = require('react')
  , {Navigation, State} = require('react-router')
  , PT = React.PropTypes
  , KeysMixin = require('../keys-mixin')
  , Dropload = require('./dropload')
  , Importer = require('./importer')
  , NewFile = require('./new-file')

var BrowseHeader = React.createClass({
  mixins: [KeysMixin],

  propTypes: {
    store: PT.object,
    file: PT.object,
    plugins: PT.object,
    keys: PT.object,
  },

  statics: {
    keys: function () {
      return {
        'n': () => this.setState({open: 'new'}),
        'i': () => this.setState({open: 'import'}),
      }
    },
  },

  getInitialState: function () {
    return {
      open: false,
    }
  },

  _onNewOpen: function (what, open) {
    this.setState({open: open ? what : null})
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

  _onImport: function (files) {
    if (!files.length) return console.warn('no files');
    // TODO what about multiple files?
    var reader = readFile(files[0], (err, text) => {
      if (err) {
        return this.setState({
          open: null,
          importError: err.message,
          importing: false,
        })
      }
      this.setState({importError: null, importing: false})
      this.props.files.importRaw(text, err => {
        if (err) {
          return this.setState({
            open: null,
            importError: err.message,
            importing: false,
          })
        }
        this.loadFiles()
      })
    })
    this.setState({
      open: null,
      importing: reader,
      importError: false,
    })
  },

  render: function () {
    var opener
    if (this.state.open === 'import') {
      opener = <Importer onSourced={this._onSourced}
        onClose={this._onNewOpen.bind(null, 'import', false)}
        keys={this.props.keys} />
    } else if (this.state.open === 'new') {
      opener = <NewFile
        onSubmit={this._onNewFile}
        keys={this.props.keys}
        onClose={this._onNewOpen.bind(null, 'new', false)}/>
    } else {
      opener = [
        <div
          onClick={this._onNewOpen.bind(null, 'new', true)}
          className='NewFile NewFile-closed'>Create</div>,
        <h1 className='Browse_title'>Notablemind</h1>,
        <div
          onClick={this._onNewOpen.bind(null, 'import')}
          className='Importer Importer-closed'>Import</div>
      ]
    }

    return <div className='BrowseHeader'>
      <div className={
        'Browse_opener' + (this.state.open ? 'Browse_opener-open' : '')
      }>
        {opener}
      </div>
      <Dropload
        onDrop={this._onImport}
        message="Drop anywhere to import"/>
      {this.state.importError &&
        'Import Error: ' + this.state.importError}
    </div>
  }
})

module.exports = BrowseHeader
