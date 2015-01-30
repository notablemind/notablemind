var React = require('react')
  , Navigation = require('react-router').Navigation
  , keys = require('treed/lib/keys')
  , files = require('../files')

  , Browse = require('../components/browse')
  , BrowseHeader = require('../components/browse-header')

function strcmp(a, b) {
  if (a === b) return 0
  if (a > b) return 1
  return -1
}

var BrowsePage = React.createClass({
  mixins: [Navigation],

  getInitialState: function () {
    return {
      keys: null,
      files: null,
      error: null,
      loading: false,
    }
  },

  componentWillMount: function () {
    var kh = keys({})
    this.setState({
      keys: kh
    })
    window.addEventListener('keydown', kh)
  },

  componentDidMount: function () {
    this._reloadFiles()
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.state.keys)
  },

  _reloadFiles: function () {
    files.list(files => {
      // sort by title
      files = files.sort((a, b) => strcmp(a.title, b.title))
      this.setState({files, error: null, loading: false})
    })
  },

  render: function () {
    return <div className='BrowsePage'>
      <BrowseHeader
        onUpdated={this._reloadFiles} />
      {this.state.files ?
        <Browse
          onOpen={file => this.transitionTo('doc', {id: file.id})}
          onUpdated={this._reloadFiles}
          keys={this.state.keys}
          fileslib={files}
          files={this.state.files} />
        : <span>Loading</span>}
    </div>
  },
})

module.exports = BrowsePage
