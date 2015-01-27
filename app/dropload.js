
var React = require('treed/node_modules/react')
  , PT = React.PropTypes

var Dropload = React.createClass({
  getDefaultProps: function () {
    return {
      message: 'Drop anywhere to upload',
    }
  },

  getInitialState: function () {
    return {
      dropping: false,
    }
  },

  // Draggage
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
    if (e.target.className.indexOf('Dropload') !== -1) {
      this.setState({dropping: false})
    }
  },

  _onDrop: function (e) {
    e.preventDefault()
    e.stopPropagation()
    // TODO: tighten this up
    var files = e.dataTransfer.files
    if (!files || !files.length) {
      files = e.dataTransfer.items
    }
    this.setState({
      dropping: false,
    })

    this.props.onDrop(files)
    return false
  },

  render: function () {
    return this.state.dropping ?
      <div className='Dropload'>{this.props.message}</div> :
      null
  },
})

module.exports = Dropload

