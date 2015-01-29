
var React = require('react/addons')
  , cx = React.addons.classSet
  , sources = require('./sources')
  , KeysMixin = require('./keys-mixin')

var Importer = React.createClass({
  _importFrom: function (name) {
    sources[name].select((err, data, config) => {
      if (err) return console.warn('failed to source')
      this.props.onSourced(data, {config: config, type: name})
    })
  },

  mixins: [KeysMixin],

  statics: {
    keys: function () {
      return {
        'j, l, down, right': this.goRight,
        'k, h, up, left': this.goLeft,
        'return': this.doSelected,
        'escape': this.props.onClose,
      }
    },
  },

  getDefaultProps: function () {
    return {
      sources: Object.keys(sources),
    }
  },

  getInitialState: function () {
    return {
      selected: 0,
    }
  },

  doSelected: function () {
    this._importFrom(this.props.sources[this.state.selected])
  },

  goLeft: function () {
    if (this.state.selected > 0) {
      this.setState({selected: this.state.selected - 1})
    }
  },

  goRight: function () {
    if (this.state.selected < this.props.sources.length - 1) {
      this.setState({selected: this.state.selected + 1})
    }
  },

  _onHide: function () {
    this.props.onClose()
  },

  render: function () {
    return <div className='Importer'>
      <button className='Importer_cancel' onClick={this._onHide}>Cancel</button>
      <h3 className='Importer_title'>Import Document</h3>
      <ul className='Importer_list'>
        {
          this.props.sources.map((name, i) => <li key={name}>
            <button
              className={cx({
                "Importer_source": true,
                'Importer_source-selected': i === this.state.selected
              })}
              onClick={this._importFrom.bind(null, name)}>
              {sources[name].title}
            </button>
          </li>)
        }
      </ul>
    </div>
  },
})

module.exports = Importer

