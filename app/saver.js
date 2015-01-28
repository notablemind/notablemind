
var React = require('react')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , sources = require('./sources')
  , DropDown = require('./dropdown')

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

  _showSource: function () {
    var source = this.props.value
    var link = sources[source.type].link(source.config)

    window.open(link)
  },

  render: function () {
    if (this.state.loading) {
      return <span>Syncing...</span>
    }
    if (!this.props.value) {
      return <DropDown
        title="Setup sync"
        items={Object.keys(sources)}
        onSelect={this._onSetup}/>
    }

    var source = this.props.value

    return <div style={{display: 'flex'}}>
      <DropDown
        title={<i className='fa fa-cog'/>}
        items={[
          {title: 'Configure', action: this._showSettings},
          sources[source.type].link && {title: 'Open ' + source.type, action: this._showSource},
        ]}
        />
      <button onClick={this._onSync}>Sync</button>
      {!this.props.value.dirty && ' Local changes saved'}
      {this.state.error}
    </div>
  },
})

module.exports = Saver

