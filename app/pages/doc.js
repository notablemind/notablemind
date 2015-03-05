var React = require('react')
  , {Navigation, State} = require('react-router')

  , KeyManager = require('treed/key-manager')
  , keys = require('treed/lib/keys')
  , files = require('../files')
  , kernelConfig = require('../kernels')

  , Treed = require('treed/classy')

  , DocHeader = require('../components/doc-header')
  , DocViewer = require('../components/doc-viewer')

function dehydrateWindows(config) {
  if (config.leaf) {
    return {
      leaf: true,
      value: {
        root: config.value.root,
        type: config.value.type,
      },
    }
  }
  return {
    leaf: false,
    value: {
      first: dehydrateWindows(config.value.first),
      second: dehydrateWindows(config.value.second),
      ratio: config.value.ratio,
      orient: config.value.orient,
    },
  }
}

var DocPage = React.createClass({
  mixins: [Navigation, State],

  componentDidMount: function () {
    this.loadFile()
    window.addEventListener('keydown', this._keyDown)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this._keyDown)

    if (this.state.treed) {
      this._unlistenToStore(this.state.treed.store)
    }
  },

  getInitialState: function () {
    return {
      loading: false,
      error: null,
    }
  },

  // file stuff
  _listenToStore: function (store) {
    store.on(['node:' + store.db.root], this._onRootChanged)
  },

  _unlistenToStore: function (store) {
    store.off(['node:' + store.db.root], this._onRootChanged)
  },

  _onRootChanged: function () {
    var db = this.state.treed.store.db
      , title = db.nodes[db.root].content
    if (title.length > 100) {
      title = title.slice(0, 98) + '..'
      window.document.title = title
    }
    this._changeTitle(title)
  },

  _changeTitle: function (title) {
    files.update(this.state.file.id, {title: title}, file => this.setState({file: file}))
  },

  _keyDown: function (e) {
    if (!this.state.treed) return
    if (this.state.treed.store.views[this.state.treed.store.activeView].mode !== 'insert' &&
        ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
      return
    }
    return this.state.treed.keyManager.keyDown(e)
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  onFileUpdate: function (file) {
    this.setState({file: file})
  },

  saveWindowConfig: function (windows, done) {
    var id = this.getParams().id
    files.update(id, {windows: dehydrateWindows(windows)}, done)
  },

  updateFile: function (update, done) {
    var id = this.getParams().id
    files.update(id, update, done)
  },

  _onLoad: function (treed, file) {
    window.store = treed.store
    window.docPage = this
    window.document.title = file.title
    this._listenToStore(treed.store)

    treed.keyManager.addKeys({
      'g q': () => this.transitionTo('browse'),
    })

    files.update(file.id, {opened: Date.now()}, file => {
      this.setState({
        loading: false,
        treed,
        file,
      })
    })
  },

  loadFile: function () {
    this.setState({error: null, loading: true})
    var id = this.getParams().id

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

    files.find(id, file =>
      files.get(id, pl => {
        var config = kernelConfig[file.repl]
        if (config && config.kernel) {
          // repl
          plugins.unshift(require('itreed/lib/plugin')(config))
        }

        var treed = new Treed({plugins: plugins})
        treed.initStore({content: file.title, children: []}, {pl}).then(store => {
          this._onLoad(treed, file)
        }).catch(err => this._onError(err))
      })
    )
  },

  render: function () {
    if (this.state.loading) {
      return <div className='DocPage DocPage-loading'>Loading</div>
    }
    if (this.state.error) {
      return <em>Error loading file {this.state.error + ''}</em>
    }
    if (!this.state.treed) {
      return <em>Loading</em>
    }
    var {treed, file} = this.state

    return <div className='DocPage'>
      <DocHeader
        file={file}
        treed={treed}
        onFileUpdate={this.onFileUpdate}

        changeTitle={this._changeTitle}
        onClose={!this.props.noHome && (() => this.transitionTo('browse'))}
      />
      <DocViewer
        file={file}
        treed={treed}
        query={this.getQuery()}
        saveWindowConfig={this.saveWindowConfig}
        keys={this.state.treed.keyManager}/>
    </div>
  },
})

module.exports = DocPage