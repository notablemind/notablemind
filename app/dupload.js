
var React = require('treed/node_modules/react')
  , PT = React.PropTypes
  , Downloader = require('./downloader')
  , Uploader = require('./uploader')
  , Dropload = require('./dropload')

var Dupload = React.createClass({
  propTypes: {
    store: PT.object.isRequired,
  },

  getInitialState: function () {
    return {
      downloading: false,
      uploading: false,
      uploadFile: null,
    }
  },

  _onDownload: function () {
    this.setState({
      downloading: true,
      uploading: false,
      uploadFile: null,
    })
  },

  _onUpload: function () {
    this.setState({
      downloading: false,
      uploading: true
    })
  },

  _onClose: function () {
    this.setState({
      downloading: false,
      uploading: false,
      uploadFile: null,
    })
  },

  _onUploaded: function (filename, trees) {
    this.props.store._actions[0].importTrees(null, trees)
    this._onClose()
  },

  _onDrop: function (files) {
    if (files.length) {
      this.setState({
        uploading: true,
        uploadFile: files[0],
      })
    }
  },

  render: function () {
    var modal = null
    if (this.state.downloading) {
      var store = this.props.store
      modal = Downloader({
        exportMany: store.db.exportMany.bind(this.props.store.db),
        nodeContents: (id) => store.db.nodes[id].content,
        ids: store.views[store.activeView].selection || [store.views[store.activeView].active],
        root: store.db.root,
        onClose: this._onClose,
      })
    } else if (this.state.uploading) {
      modal = Uploader({
        initialFile: this.state.uploadFile,
        onUploaded: this._onUploaded,
        store: this.props.store,
        onClose: this._onClose,
      })
    }

    return <div className='Dupload'>
      <span className='Dupload_download' onClick={this._onDownload}> <span/> </span>
      <span className='Dupload_upload' onClick={this._onUpload}> <span/> </span>
      {modal}
      <Dropload onDrop={this._onDrop} message="Drop anywhere to import"/>
    </div>
  },
})

module.exports = Dupload

