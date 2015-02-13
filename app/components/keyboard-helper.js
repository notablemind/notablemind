/**
 * Pops up when you type "?" in normal / visual mode.
 */

var React = require('react')
  , viewKeys = require('treed/views/tree/keys')
  , KeysMixin = require('../keys-mixin')
  , KeyboardPopup = require('./keyboard-popup')
  , PT = React.PropTypes

var KeyboardHelper = React.createClass({
  mixins: [KeysMixin],

  statics: {
    keys: function () {
      return {
        'shift+/': this.show,
      }
    },
  },

  propTypes: {
    plugins: PT.arrayOf(PT.object).isRequired,
    keys: PT.func.isRequired,
  },

  getInitialState: function () {
    return {open: false}
  },
  componentDidUpdate: function (prevProps, prevState) {
    if (this.state.open && !prevState.open) { // register things
      this.props.keys.disable()
      window.addEventListener('keydown', this._onKeyDown)
    }
    if (prevState.open && !this.state.open) { // unregister things
      this.props.keys.enable()
      window.removeEventListener('keydown', this._onKeyDown)
    }
  },

  show: function () {
    this.setState({open: true})
  },
  hide: function () {
    this.setState({open: false})
  },
  _onKeyDown: function (e) {
    if (e.keyCode === 27) this.hide()
  },

  organizeSections: function () {
    var sections = [];
    // make default sections
    sections = sections.concat(this.props.plugins.reduce((sections, plugin) => {
      if (!plugin.keys) return sections
      var keys = plugin.keys
      if ('function' === typeof keys) {
        keys = keys(this.props.plugins)
      }
      sections.push({
        title: plugin.title,
        actions: keys
      })
      return sections
    }, []))
    // debugger;
    return sections
  },

  render: function () {
    if (!this.state.open) return <span/>
    return <KeyboardPopup sections={this.organizeSections()} onClose={this.hide}/>
  },
})

module.exports = KeyboardHelper
