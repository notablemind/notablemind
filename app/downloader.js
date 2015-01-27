
var React = require('treed/node_modules/react/addons')
  , PT = React.PropTypes
  , cx = React.addons.classSet
  , Modal = require('./modal')
  , FormatPicker = require('./format-picker')
  , convert = require('./convert')
  , saveAs = require('../lib/save-as')

var Downloader = React.createClass({
  propTypes: {
    nodeContents: PT.func.isRequired,
    exportMany: PT.func.isRequired,
    onClose: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      name: this._getDefaultName(false),
      whole_notebook: false,
      format: 'notablemind',
    }
  },

  componentDidMount: function () {
    var inp = this.refs.input.getDOMNode()
    inp.focus()
    inp.selectionStart = 0
    inp.selectionEnd = inp.value.length
  },

  _getDefaultName: function (whole_notebook) {
    var id = this.props.ids[0]
    if (whole_notebook) {
      id = this.props.root
    }
    return this.props.nodeContents(id).trim().replace(/[^\w-_.]/g, '-').slice(0, 100)
  },

  _onKeyDown: function (e) {
    if (e.key !== 'Enter') return
    this.onDownload()
  },

  onDownload: function () {
    var ids = this.state.whole_notebook ? [this.props.root] : this.props.ids
      , format = this.state.format
      , trees = this.props.exportMany(ids)
      , data = convert[format].strFromTrees(trees)
      , mime = convert[format].mime
      , blob = new Blob([data], {type: mime})
      , url = URL.createObjectURL(blob)
    saveAs(url, this.fileName())
    this.props.onClose()
  },

  fileName: function () {
    return this.state.name + '.' + convert[this.state.format].ext
  },

  _onChangeName: function (e) {
    this.setState({name: e.target.value})
  },

  _onChangeFormat: function (format) {
    this.setState({format: format})
  },

  _setWhole: function (whole) {
    this.setState({
      whole_notebook: whole,
      name: this._getDefaultName(whole),
    })
  },

  render: function () {
    var ids = this.props.ids
      , whole_notebook = this.state.whole_notebook
      , whole = false
      , what
    if (ids.length === 1) {
      if (ids[0] === this.props.root) {
        what = 'the whole notebook'
        whole = true
      } else {
        what = '1 item'
      }
    } else {
      what = ids.length + ' items'
    }
    return <Modal onClose={this.props.onClose} title="Download" className="Modal-download">
      {whole ?
        <span className='Download_what'>Download the whole notebook</span> :
        <span className='Download_what'>Download
          <button onClick={this._setWhole.bind(null, false)} className={cx({
            'Download_which': true,
            'Download_which-selected': !this.state.whole_notebook,
          })}>{what}</button>
          <button onClick={this._setWhole.bind(null, true)} className={cx({
            'Download_which': true,
            'Download_which-selected': this.state.whole_notebook,
          })}>the whole notebook</button>
        </span>}
      <FormatPicker formats={convert.formats} format={this.state.format} onChange={this._onChangeFormat}/>
      File name:
      <input
          ref="input"
          className='Download_name'
          value={this.state.name}
          onKeyDown={this._onKeyDown}
          onChange={this._onChangeName}/>
      <span className='Download_ext'>.{convert[this.state.format].ext}</span>
      <br/>
      <button className="Download_link" onClick={this.onDownload}>
        Download
      </button>
    </Modal>
  }
})

module.exports = Downloader

