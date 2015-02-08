
var React = require('react')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , sources = require('../sources')
  , DropDown = require('./dropdown')
  , sync = require('../sync')
  , files = require('../files')
  , assign = require('../assign')
  , sourceSettings = require('./source-settings')

function saveTimer(save, longTime, shortTime) {
  var last = null
    , longSync = null
    , shortSync = null
  function doSave() {
    clearTimeout(longSync)
    clearTimeout(shortSync)
    save(() => {
      longSync = setTimeout(doSave, longTime)
    })
  }
  longSync = setTimeout(doSave, longTime)
  return {
    dirty: function () {
      clearTimeout(shortSync)
      shortSync = setTimeout(doSave, shortTime)
    },
    clear: function () {
      clearTimeout(longSync)
      clearTimeout(shortSync)
    },
  }
}

var Saver = React.createClass({
  propTypes: {
    store: PT.object.isRequired,
    value: PT.object.isRequired, // the source
    file: PT.object.isRequired,
    onFileUpdate: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      loading: false,
      error: false,
    }
  },

  componentDidMount: function () {
    this.props.store.on(['changed'], this._onDirty)
    if (this.props.value && this.props.value.autosync) {
      this._startTimer()
      if (this.props.value.dirty) this._saveTimer.dirty()
    }
  },

  componentWillUnmount: function () {
    this.props.store.off(['changed'], this._onDirty)
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.store !== this.props.store) {
      this.props.store.off(['changed'], this._onDirty)
      nextProps.store.on(['changed'], this._onDirty)
    }
    // need to start up autosync
    if (nextProps.value && nextProps.value.autosync && (!this.props.value || !this.props.value.autosync)) {
      this._startTimer()
    }
    if (!nextProps.value || !nextProps.value.autosync) {
      this._clearTimer()
    }
  },

  _startTimer: function () {
    this._saveTimer = saveTimer(this._onSync, 5 * 60 * 1000, 15 * 1000)
  },

  _clearTimer: function () {
    if (!this._saveTimer) return
    this._saveTimer.clear()
    delete this._saveTimer
  },

  _onDirty: function () {
    if (!this.props.file.source) {
      return files.update(this.props.file.id, {
        modified: Date.now()
      }, file => this.props.onFileUpdate(file))
    }
    var source = assign({}, this.props.file.source, {dirty: true})
    files.update(this.props.file.id, {
      source: source,
      modified: Date.now(),
    }, file => this.props.onFileUpdate(file))
    if (this._saveTimer) this._saveTimer.dirty()
  },

  _onSetup: function (item) {
    this.setState({loading: true})
    this._realSetup(item.type, (err) => {
      this.setState({
        error: err,
        loading: false,
      })
    })
  },

  _onSync: function (done) {
    this.setState({loading: true})
    this._realSync((err) => {
      this.setState({
        error: err,
        loading: false,
      })
      done && done()
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
      , exported = sync.exportContents(this.props.file, store)
      , title = store.db.nodes[store.db.root].content
    sources[type].saveAs(title, exported, (err, config, time) => {
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
    sourceSettings(this.props.file.source, (err, settings) => {
      if (err) return console.warn('failed to do settings dialog', err)
      var source = assign({}, this.props.file.source, settings)
      files.update(this.props.file.id, {
        source: source
      }, file => this.props.onFileUpdate(file))
    })
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
          items={Object.keys(sources).map(name => ({title: sources[name].title, type: name}))}
          onSelect={this._onSetup}/>
      </div>
    }

    var source = this.props.value

    return <div className='Saver' style={{display: 'flex'}}>
      <button className='Saver_sync' onClick={this._onSync.bind(null, false)}><i className='fa fa-refresh'/></button>
      <span className='Saver_message'> {
        this.props.value.dirty ? (this.props.value.autosync ? '' : 'Unsaved local changes') : 'Local changes saved'
      }</span>
      <DropDown
        title={<i className='fa fa-cog' style={{margin: '5px 10px'}}/>}
        items={[
          {title: 'Configure', action: this._showSettings},
          sources[source.type].link && {title: 'Open with ' + sources[source.type].title, action: this._showSource},
        ]}
        />
      {this.state.error}
    </div>
  },
})

module.exports = Saver

