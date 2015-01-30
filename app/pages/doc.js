var React = require('react')
  , {Navigation, State} = require('react-router')

  , keys = require('treed/lib/keys')
  , files = require('../files')

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
    var kh = keys({
      'g q': () => this.transitionTo('browse'),
    })
    this.setState({
      keys: kh
    })
    this.loadFile()
    window.addEventListener('keydown', kh)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.state.keys)
  },

  getInitialState: function () {
    return {
      loading: false,
      error: null,
    }
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

  loadFile: function () {
    this.setState({error: null, loading: true})
    var id = this.getParams().id

    files.find(id, file =>
      files.get(id, pl => {
        // if (err) return this._onError(err)
        files.init(file, pl, (err, store, plugins) => {
          if (err) {
            return this._onError(err)
          }
          files.update(file.id, {opened: Date.now()}, file => {
            this.setState({
              file,
              store,
              plugins,
              loading: false,
            })
          })
        })
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
    if (!this.state.store) {
      return <em>Loading</em>
    }
    var {store, file, plugins} = this.state

    return <div className='DocPage'>
      <DocHeader
        file={file}
        store={store}
        plugins={plugins}
        onFileUpdate={this.onFileUpdate}

        setPanes={this._setPanes}
        changeTitle={this._changeTitle}
        onClose={!this.props.noHome && (() => this.transitionTo('browse'))}
      />
      <DocViewer
        file={file}
        store={store}
        plugins={plugins}
        query={this.getQuery()}
        saveWindowConfig={this.saveWindowConfig}
        keys={this.state.keys}/>
    </div>
  },
})

module.exports = DocPage
