
var React = require('react')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , sources = require('./sources')
  , DropDown = require('./dropdown')

var Saver = React.createClass({
  propTypes: {
    store: PT.object,
    value: PT.source,
  },
  getInitialState: function () {
    return {
      loading: false,
      error: false,
    }
  },

  _onSetup: function (type) {
    this.setState({loading: true})
    this._realSetup(type, (err) => {
      this.setState({
        error: err,
        loading: false,
      })
    })
  },

  _onSync: function () {
    this.setState({loading: true})
    this._realSync((err) => {
      this.setState({
        error: err,
        loading: false,
      })
    })
  },

  _realSync: function (done) {
    sync.doSync(this.state.file, this.state.store, (err, file) => {
      if (err) return done(err)
      if (file) this.props.onFileUpdate(file)
      done()
    })
  },

  _realSetup: function (type, done) {
    var store = this.state.store
      , text = JSON.stringify(store.db.exportTree(null, true), null, 2)
      , title = store.db.nodes[store.db.root].content
    SOURCES[type].saveAs(title, text, (err, config, time) => {
      if (err) return done(new Error('Failed to set source'))
      localFiles.update(this.state.file.id, {
        source: {
          type: type,
          config: config,
          synced: time,
          dirty: false,
        }
      }, file => {
        this.props.onFileUpdate(file)
        done()
      })
    })
  },

  _clearSource: function (done) {
    localFiles.update(this.state.file.id, {source: null}, done)
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

    return <div className='Saver' style={{display: 'flex'}}>
      <DropDown
        title={<i className='fa fa-cog' style={{margin: '5px 10px'}}/>}
        items={[
          {title: 'Configure', action: this._showSettings},
          sources[source.type].link && {title: 'Open ' + source.type, action: this._showSource},
        ]}
        />
      <button onClick={this._onSync}>Sync</button>
      <span className='Saver_message'> {this.props.value.dirty ? 'Unsaved local changes' : 'Local changes saved'}</span>
      {this.state.error}
    </div>
  },
})

module.exports = Saver

