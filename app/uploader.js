
var React = require('treed/node_modules/react')
  , PT = React.PropTypes
  , Modal = require('./modal')
  , FormatPicker = require('./format-picker')
  , readFile = require('./read-file')
  , convert = require('./convert')

var Uploader = React.createClass({
  propTypes: {
    initialFile: PT.object,
  },

  getInitialState: function () {
    return {
      mode: 'insert',
      format: this.props.initialFile && convert.detect(this.props.initialFile.name) || 'nm',
      file: this.props.initialFile,
      reader: null,
      error: null,
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.initialFile !== this.props.initialFile) {
      this.setFile(nextProps.initialFile)
    }
  },

  setFile: function (file) {
    var update = {
      file: file
    }
    if (file) {
      var format = convert.detect(file.name)
      if (format) {
        update.format = format
      }
    }
    this.setState(update)
  },

  _onChangeFormat: function (format) {
    this.setState({format: format})
  },

  _onChangeMode: function (mode) {
    this.setState({mode: mode})
  },

  _onChangeFile: function (e) {
    this.setFile(e.target.files[0])
  },

  _onClearFile: function () {
    this.setState({file: null})
  },

  _onSubmit: function () {
    var reader = readFile(this.state.file, (err, text) => {
      if (err) {
        return this.setState({
          reader: null,
          error: err.message,
        })
      }

      var data = convert[this.state.format].treeFromStr(text)
      if (data instanceof Error) {
        return this.setState({
          reader: null,
          error: data.message
        })
      }

      this.setState({
        reader: null,
        error: null
      })

      this.props.onUploaded(this.state.file.name, data)
    })

    this.setState({
      reader: reader,
      error: false,
    })
  },

  file: function () {
    if (this.state.file) {
      return <div className='Uploader_file'>
        <span>{this.state.file.name + ' ' + this.state.file.size + 'kb'}</span>
        <button className='Uploader_clear' onClick={this._onClearFile}>&times;</button>
      </div>
    }
    return <input className='Uploader_input' type="file" onChange={this._onChangeFile}/>
  },

  render: function () {
    if (this.state.reader) {
      return <Modal className="Modal-upload" onClose={this.props.onClose} title="Import">
        Loading file...
      </Modal>
    }

    return <Modal className="Modal-upload" onClose={this.props.onClose} title="Import">
      {this.state.error && <div className="Uploader_error">{this.state.error}</div>}
      <FormatPicker
        formats={[["replace", "Replace notebook"], ["insert", "Insert at cursor"]]}
        onChange={this._onChangeMode}
        format={this.state.mode}/>
      {this.file()}
      {this.state.file && 
        <FormatPicker
          formats={convert.formats}
          onChange={this._onChangeFormat}
          format={this.state.format}/>}
      <br/>
      <button onClick={this._onSubmit} className="Uploader_submit">Import</button>
    </Modal>
  }
})

module.exports = Uploader


