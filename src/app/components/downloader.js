
var React = require('react')
  , PT = React.PropTypes
  , cx = require('classnames')
  , Modal = require('../modal')
  , FormatPicker = require('./format-picker')
  , convert = require('../convert')
  , saveAs = require('../../lib/save-as')

const electronSaveAs = (text, filename) => {
  const fs = require('fs')
  const path = require('path')
  const HOME = process.env['HOME']
  let dest = path.join(HOME, 'Downloads')
  if (!fs.existsSync(dest)) {
    dest = HOME
  }
  let full = path.join(dest, filename)
  if (fs.existsSync(full)) {
    let i = 0
    let fullt = full + '-' + i
    while (fs.existsSync(fullt)) {
      i += 1
      fullt = full + '-' + i
    }
    full = fullt
  }
  fs.writeFileSync(full, text)
}

var Downloader = React.createClass({
  propTypes: {
    nodeContents: PT.func.isRequired,
    exportMany: PT.func.isRequired,
    onClose: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      name: this._getDefaultName(false),
      wholeNotebook: false,
      format: 'notablemind',
    }
  },

  componentDidMount: function () {
    var inp = this.refs.input
    inp.focus()
    inp.selectionStart = 0
    inp.selectionEnd = inp.value.length
  },

  _getDefaultName: function (wholeNotebook) {
    var id = this.props.ids[0]
    if (wholeNotebook) {
      id = this.props.root
    }
    return this.props.nodeContents(id).trim().replace(/[^\w-_.]/g, '-').slice(0, 100)
  },

  _onKeyDown: function (e) {
    if (e.key !== 'Enter') return
    this.onDownload()
  },

  onDownload: function () {
    var ids = this.state.wholeNotebook ? [this.props.root] : this.props.ids
      , format = this.state.format
      , trees = this.props.exportMany(ids)
      , data = convert[format].strFromTrees(trees)
      , mime = convert[format].mime
      , blob = new Blob([data], {type: mime})
      , url = URL.createObjectURL(blob)
    if (ELECTRON) {
      electronSaveAs(data, this.fileName())
    } else {
      saveAs(url, this.fileName())
    }
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
      wholeNotebook: whole,
      name: this._getDefaultName(whole),
    })
  },

  render: function () {
    let ids = this.props.ids
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
            'Download_which-selected': !this.state.wholeNotebook,
          })}>{what}</button>
          <button onClick={this._setWhole.bind(null, true)} className={cx({
            'Download_which': true,
            'Download_which-selected': this.state.wholeNotebook,
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

