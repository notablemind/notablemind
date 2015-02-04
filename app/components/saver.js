
var React = require('react')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , sources = require('../sources')
  , DropDown = require('./dropdown')
  , sync = require('../sync')
  , files = require('../files')

var Saver = React.createClass({
  propTypes: {
    store: PT.object,
    value: PT.object,
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
    sync.doSync(this.props.file, this.props.store, (err, file) => {
      if (err) return done(err)
      if (file) this.props.onFileUpdate(file)
      done()
    })
  },

  _realSetup: function (type, done) {
    var store = this.props.store
      , text = JSON.stringify(store.db.exportTree(null, true), null, 2)
      , title = store.db.nodes[store.db.root].content
    sources[type].saveAs(title, text, (err, config, time) => {
      if (err) return done(new Error('Failed to set source'))
      files.update(this.props.file.id, {
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
    files.update(this.props.file.id, {source: null}, done)
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
      return <div className='Saver Saver-syncing'>
        <i className='fa fa-refresh fa-spin' style={{margin: '5px 10px'}}/>
        Syncing...
      </div>
    }
    if (!this.props.value) {
      return <div className='Saver Saver-none'>
        <DropDown
          title="Setup sync"
          items={Object.keys(sources)}
          onSelect={this._onSetup}/>
      </div>
    }

    var source = this.props.value

    return <div className='Saver' style={{display: 'flex'}}>
      <button className='Saver_sync' onClick={this._onSync}><i className='fa fa-refresh'/></button>
      <span className='Saver_message'> {this.props.value.dirty ? 'Unsaved local changes' : 'Local changes saved'}</span>
      <DropDown
        title={<i className='fa fa-cog' style={{margin: '5px 10px'}}/>}
        items={[
          /*{title: 'Configure', action: this._showSettings},*/
          sources[source.type].link && {title: 'Open ' + source.type, action: this._showSource},
        ]}
        />
      {this.state.error}
    </div>
  },
})

module.exports = Saver

