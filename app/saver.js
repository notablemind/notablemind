
var React = require('treed/node_modules/react')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , sources = require('./sources')
  , DropDown = require('./drop-down')

var Saver = React.createClass({
  propTypes: {
    onSync: PT.func.isRequired,
    onSetup: PT.func.isRequired,
    onClear: PT.func.isRequired,
  },
  getInitialState: function () {
    return {
      loading: false,
      error: false,
    }
  },

  _onSetup: function (type) {
    this.setState({loading: true})
    this.props.onSetup(type, (err) => {
      this.setState({
        error: err,
        loading: false,
      })
    })
  },
  _onSync: function () {
    this.setState({loading: true})
    this.props.onSync((err) => {
      this.setState({
        error: err,
        loading: false,
      })
    })
  },

  _showSettings: function () {
    fail
  },

  render: function () {
    if (this.state.loading) {
      return <span>Syncing...</span>
    }
    if (!this.props.value) {
      return <DropDown
        blank="Setup sync"
        options={Object.keys(sources)}
        onSelect={this._onSetup}/>
    }

    var source = this.props.value
    var link = sources[source.type].link ?
      <a target="_blank" href={sources[source.type].link(source.config)}>{source.type}</a> : source.type;

    return <span>
      <button onClick={this._onSync}>Sync</button> with {link}
      {!this.props.value.dirty && 'All changes saved'}
      {this.state.error}
      <button onClick={this._showSettings}>Settings</button>
    </span>
  },
})

module.exports = Saver

