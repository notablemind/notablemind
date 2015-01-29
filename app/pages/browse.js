var React = require('react')
  , Navigation = require('react-router').Navigation
  , keys = require('treed/lib/keys')
  , files = require('../files')

  , Browse = require('../components/browse')
  , BrowseHeader = require('../components/browse-header')

var BrowsePage = React.createClass({
  mixins: [Navigation],

  getInitialState: function () {
    return {keys: null}
  },

  componentWillMount: function () {
    var kh = keys({})
    this.setState({
      keys: kh
    })
    window.addEventListener('keydown', kh)
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.state.keys)
  },

  render: function () {
    return <div className='BrowsePage'>
      <BrowseHeader
        />
      <Browse
        onOpen={id => this.transitionTo('doc', {id: id})}
        keys={this.state.keys}
        files={files} />
    </div>
  },
})

module.exports = BrowsePage
