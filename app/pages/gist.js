var React = require('react')
  , {Navigation, State} = require('react-router')

  , keys = require('treed/lib/keys')
  , files = require('../files')

  , GistViewer = require('../components/gist-viewer')

var GistPage = React.createClass({
  mixins: [Navigation, State],

  componentDidMount: function () {
    var kh = keys(())
    this.setState({
      keys: kh
    })
    window.addEventListener('keydown', kh)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.state.keys)
  },

  render: function () {
    return <GistViewer
      onClose={() => this.transitionTo('browse')}
      onGist={id => this.transitionTo('gist', {id: id})}
      onOpen={id => this.transitionTo('doc', {id: id})}
      keys={this.state.keys}
      files={files} />
  },
})

module.exports = GistPage
