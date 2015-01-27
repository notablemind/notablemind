
var React = require('treed/node_modules/react/addons')
  , cx = React.addons.classSet
  , sources = require('./sources')

var Importer = React.createClass({
  _imoportFrom: function (name) {
    sources[name].select((err, data, config) => {
      if (err) return console.warn('failed to source')
      this.props.onSourced(data, {config: config, type: name})
    })
  },

  _onShow: function () {
    this.props.onOpen(true)
  },

  _onHide: function () {
    this.props.onOpen(false)
  },

  render: function () {
    if (!this.props.open) {
      return <div onClick={this._onShow} className='Importer Importer-closed'>Import</div>
    }
    return <div className='Importer'>
      <button className='Importer_cancel' onClick={this._onHide}>Cancel</button>
      <h3 className='Importer_title'>Import Document</h3>
      <ul className='Importer_list'>
        {
          Object.keys(sources).map(name => <li>
            <button onClick={this._imoportFrom.bind(null, name)}>
              {sources[name].title}
            </button>
          </li>)
        }
      </ul>
    </div>
  },
})

module.exports = Importer

