/** @jsx React.DOM */

var isValidFormat = require('./is-valid-format')

var ImportPopover = module.exports = React.createClass({
  displayName: 'ImportPopover',
  propTypes: {
    file: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    onLoad: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      error: null,
      reader: null
    }
  },
  componentWillReceiveProps: function (nextProps) {
    if (this.props.file !== nextProps) {
      this.setState({error: false})
    }
  },

  _onSubmit: function () {
    var reader = new FileReader()

    reader.onerror = function () {
      this.setState({
        reader: null,
        error: 'Failed to load file.'
      })
    }.bind(this)

    reader.onabort = function () {
      this.setState({
        reader: null,
        error: 'Upload cancelled'
      })
    }.bind(this)

    reader.onload = function (evt) {
      var data
      try {
        data = JSON.parse(evt.target.result)
      } catch (e) {
        console.error("Failed to parse file", e, evt.target.results)
        return this.setState({
          reader: null,
          error: new Error("Invalid format. You can only import files that were exported from notablemind.")
        })
      }

      if (!isValidFormat(data)) {
        return this.setState({
          reader: null,
          error: new Error("Invalid format. You can only import files that were exported from notablemind.")
        })
      }

      this.setState({
        reader: null,
        error: null
      })

      this.props.onLoad(this.props.file.name, data, {})
    }.bind(this)

    reader.readAsText(this.props.file)

    this.setState({
      reader: reader,
      error: false,
    })

  },

  _onChange: function (e) {
    this.props.onChange(e.target.files[0])
  },
  _onRemove: function () {
    this.props.onChange(null)
  },

  render: function () {
    return <div className='import-popover'>
      <h3 className='import-popover_title'>
        Import into Notablemind
      </h3>
      <button onClick={this.props.onClose} className='import-popover_close'/>
      {this.body()}
    </div>
  },

  body: function () {
    // loading
    if (this.state.reader) {
      return <div className='import-popover_loading'>
        <i className='fa fa-spin fa-spinner'/>
        <span className='import-popover_loading-text'>
          Loading
        </span>
      </div>
    }

    if (this.props.file) {
      return [
        <div className='import-popover_file'>
          <span className='import-popover_filename'>{this.props.file.name}</span>
          <button
            onClick={this._onRemove}
            className='import-popover_remove'/>
        </div>,
        this.state.error && <p className='import-popover_error'>{this.state.error.message}</p>,
        <button className='import-popover_submit' onClick={this._onSubmit}>Import</button>
      ]
    }

    return [
      <p className='import-popover_upload-text'>
        Drag and Drop or click to select a file.
      </p>,
      <input type='file' onChange={this._onChange}/>
    ]
  }
})

