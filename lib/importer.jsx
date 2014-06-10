/** @jsx React.DOM */

var ImportPopover = require('./import-popover.jsx')

var Importer = module.exports = React.createClass({
  displayName: 'Importer',
  propTypes: {
    btnClassName: React.PropTypes.string,
    onLoad: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return {
      dropping: false,
      showing: false,
      file: null
    }
  },

  componentDidMount: function () {
    window.addEventListener('dragenter', this._onDragOver)
    window.addEventListener('dragover', this._onDragOver)
    window.addEventListener('dragleave', this._onDragEnd)
    window.addEventListener('drop', this._onDrop)
  },
  componentWillUnmount: function () {
    window.removeEventListener('dragenter', this._onDragOver)
    window.removeEventListener('dragleave', this._onDragEnd)
    window.removeEventListener('dragover', this._onDragOver)
    window.removeEventListener('drop', this._onDrop)
  },

  _onDragOver: function (e) {
    e.preventDefault()
    this.setState({dropping: true})
    return false
  },
  _onDragEnd: function (e) {
    if (e.target.className.indexOf('import_dropper') !== -1) {
      this.setState({dropping: false})
    }
  },
  _onDrop: function (e) {
    e.preventDefault()
    e.stopPropagation()
    var file = e.dataTransfer.files[0]
    if (!file) {
        file = e.dataTransfer.items[0]
    }
    this.setState({file: file, dropping: false, showing: true})
    return false
  },

  _onShow: function () {
    this.setState({showing: true})
  },
  _onHide: function () {
    this.setState({showing: false})
  },
  _onLoad: function (filename, data, options) {
    this._onHide()
    this.props.onLoad(filename, data, options)
  },

  _onChangeFile: function (file) {
    this.setState({file: file})
  },

  render: function () {
    return <div className="importer">
      <button className={this.props.btnClassName} onClick={this._onShow}>
        <i className="fa fa-upload"/>
      </button>
      <div className={"import_dropper" + (this.state.dropping ? ' dropping' : '')}/>
      {this.state.showing && <div className='importer_back' onClick={this._onHide}/>}
      {this.state.showing && this.popover()}
    </div>
  },

  popover: function () {
    return ImportPopover({
      file: this.state.file,
      onClose: this._onHide,
      onChange: this._onChangeFile,
      onLoad: this._onLoad
    })
  }
})

