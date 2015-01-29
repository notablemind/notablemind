var React = require('react')
  , {Navigation, State} = require('react-router')

  , keys = require('treed/lib/keys')
  , files = require('../files')

  , DocHeader = require('../components/doc-header')
  , DocViewer = require('../components/doc-viewer')

var DocPage = React.createClass({
  mixins: [Navigation, State],

  componentDidMount: function () {
    var kh = keys({
      'g q': () => this.transitionTo('browse'),
    })
    this.setState({
      keys: kh
    })
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

  loadFile: function () {
    this.setState({error: null, loading: true})
    var id = this.getParams().id

    files.get(id, (err, pl) => {
      if (err) return this._onError(err)
      files.init(file, pl, (err, store, plugins) => {
        if (err) {
          return this._onError(err)
        }
        files.update(file.id, {opened: Date.now()}, file => {
          this.setState({
            file,
            store,
            plugins,
          })
        })
      })
    })
  },

  render: function () {
    if (this.state.loading) {
      return <em>Loading</em>
    }
    if (this.state.error) {
      return <em>Error loading file</em>
    }
    if (!this.state.store) {
      return <em>Loading</em>
    }
    var {store, file, plugins} = this.state
    return <div className='DocViewer'>
      <DocHeader
        store={store}
        file={file}
        plugins={plugins}
        keys={this.state.keys}/>
      <DocViewer
        query={this.getQuery()}
        store={store}
        file={file}
        plugins={plugins}
        keys={this.state.keys}/>
    </div>
  },
})

module.exports = DocPage
