var React = require('react')
  , {Link, State, Navigation} = require('react-router')
  , KeysMixin = require('../keys-mixin')
  , PT = React.PropTypes

var DocViewer = React.createClass({
  mixins: [KeysMixin],

  propTypes: {
    store: PT.object,
    file: PT.object,
    plugins: PT.object,
    keys: PT.object,
  },

  propTypes: {
    keys: PT.object.isRequired,
    // files: PT.object.isRequired,
  },

  _onError: function (err) {
    this.setState({loading: false, error: err})
  },

  render: function () {
    var {store, file, plugins} = this.props
    return <div className='DocViewer'>
    </div>
  }
})

module.exports = DocViewer
