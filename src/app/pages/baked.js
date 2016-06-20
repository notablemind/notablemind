import defaultPlugins from '../../config/plugins'
import defaultViewTypes from '../../config/view-types'

var React = require('react')
  , PT = React.PropTypes

  , KeyManager = require('treed/key-manager')
  , MemPL = require('treed/pl/mem')
  , files = require('../files')
  , kernelConfig = require('../kernels')
  , Treed = require('treed/classy')

  , DocHeader = require('../components/doc-header')
  , DocViewer = require('../components/doc-viewer')

function init(data, done) {
  var pl = new MemPL()
  var file = {
    title: data.title || 'Notablemind Doc',
    repl: data.repl,
  }
  var plugins = [
    require('treed/plugins/undo'),
    require('treed/plugins/todo'),
    require('treed/plugins/image'),
    require('treed/plugins/types'),
    require('treed/plugins/collapse'),
    require('treed/plugins/clipboard'),
    require('treed/plugins/lists'),
    require('treed/plugins/rebase'),
    require('../../treed-plugins/custom-css'),
  ]
  // TODO use defaultPlugins

  var config = kernelConfig[file.repl]
  if (config && config.kernel) {
    // repl
    plugins.unshift(require('itreed/lib/plugin')(config))
  }

  var treed = new Treed({plugins: plugins})
  treed.initStore(data.root, {pl}).then(store => {
    done(null, treed, file)
  }).catch(err => done(err))

}

var BakedDoc = React.createClass({

  statics: {
    load: function (data, done) {
      init(data, (err, treed, file) => {
        if (err) return done(err)

        done(null, <BakedDoc
          file={file}
          treed={treed}/>)
      })
    },
  },

  propTypes: {
    file: PT.object,
    treed: PT.object,
  },
  getInitialState: function () {
    return {
      file: this.props.file
    }
  },

  componentDidMount: function () {
    window.addEventListener('keydown', this._keyDown)
    this._listenToStore(this.props.treed.store)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this._keyDown)

    if (this.props.treed.store) {
      this._unlistenToStore(this.props.treed.store)
    }
  },


  // file stuff
  _listenToStore: function (store) {
    store.on(['changed'], this._onDirty)
    store.on(['node:' + store.db.root], this._onRootChanged)
  },

  _unlistenToStore: function (store) {
    store.off(['changed'], this._onDirty)
    store.off(['node:' + store.db.root], this._onRootChanged)
  },

  _onDirty: function () {
    var source = this.state.file.source
    this.state.file.modified = Date.now()
    if (!source) return
    source.dirty = true
    this.setState({file: this.state.file})
  },

  _onRootChanged: function () {
    var db = this.props.treed.store.db
      , title = db.nodes[db.root].content
    if (title.length > 100) {
      title = title.slice(0, 98) + '..'
      window.document.title = title
    }
    this._changeTitle(title)
  },

  _keyDown: function (e) {
    if (!this.props.treed) return
    if (this.props.treed.store.views[this.props.treed.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
      return
    }
    return this.props.treed.keyManager.keyDown(e)
  },

  _changeTitle: function (title) {
    var file = this.state.file
    file.title = title
    this.setState({file})
  },

  render: function () {
    var {treed} = this.props
      , file = this.state.file

    return <div className='DocPage'>
      <DocHeader
        file={file}
        treed={treed}
        noSave={true}
        onFileUpdate={file => this.setState({file})}

        changeTitle={this._changeTitle}
      />
      <DocViewer
        file={file}
        treed={treed}
        viewTypes={defaultViewTypes}
        saveWindowConfig={(_, done) => done && done()}
        keys={this.props.treed.keyManager}/>
    </div>
  },
})

module.exports = BakedDoc

