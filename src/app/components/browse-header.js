var React = require('react')
  , PT = React.PropTypes
  , KeysMixin = require('../keys-mixin')
  , Dropload = require('./dropload')
  , Importer = require('./importer')
  , NewFile = require('./new-file')
  , Morph = require('../helpers/morph')
  , readFile = require('./read-file')

import {StyleSheet, css} from 'aphrodite'

var BrowseHeader = React.createClass({
  mixins: [KeysMixin, Morph],

  propTypes: {
    onUpdated: PT.func,
    store: PT.object,
    fileslib: PT.object,
    plugins: PT.object,
    keys: PT.func,
  },

  statics: {
    keys: function () {
      return {
        'n, c': () => this.setState({open: 'new'}),
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
    this.props.fileslib.importRaw(data, (err, file) => {
      if (err) {
        return console.warn('failed to import file', err) // TODO UI?
      }
      if (source) {
        this.props.fileslib.update(file.id, {source: source}, () => {
          if (false) {
            return console.warn('failed to update') // TODO UI?
          }
          this.props.onUpdated()
        })
      } else {
        this.props.onUpdated()
      }
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
      this.props.fileslib.importRaw(text, err => {
        if (err) {
          return this.setState({
            open: null,
            importError: err.message,
            importing: false,
          })
        }
        this.props.onUpdated()
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
        onSubmit={this.props.onNewFile}
        keys={this.props.keys}
        onClose={this._onNewOpen.bind(null, 'new', false)}/>
    } else {
      opener = [
        <div
          key={1}
          onClick={this._onNewOpen.bind(null, 'new', true)}
          className={css(styles.newFile, styles.newFileClosed)}
        >
          Create
        </div>,
        <h1 key={2} className={css(styles.browseTitle)}>Notablemind</h1>,
        <div
          key={3}
          onClick={this._onNewOpen.bind(null, 'import')}
          className={css(styles.importer, styles.importerClosed)}
        >
          Import
        </div>
      ]
    }

    return <div className={css(styles.browseHeader)}>
      <div className={css(
        styles.opener,
        this.state.open && styles.open
      )}>
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

const button = {
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
  }
}

const styles = StyleSheet.create({
  browseHeader: {},

  opener: {
    display: 'flex',
    flexDirection: 'row',
  },

  open: {
    display: 'block',
  },

  newFile: {
    position: 'relative',
    padding: '0 20px',
  },

  newFileClosed: {
    ...button,
    padding: 10,
  },

  importer: {
    position: 'relative',
  },

  importerClosed: {
    ...button,
  },

  browseTitle: {
    margin: '2px 45px 0',
    textAlign: 'center',
    color: '#4d4d4d',
  },
})

module.exports = BrowseHeader
