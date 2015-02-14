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
        'shift+/': this.showKey,
      }
    },
  },

  propTypes: {
    canGrabKeyboard: PT.func.isRequired,
    plugins: PT.arrayOf(PT.object).isRequired,
    keys: PT.object.isRequired,
  },

  getInitialState: function () {
    return {open: false}
  },

  showKey: function (e) {
    if (!this.props.canGrabKeyboard(e)) return true
    this.show()
  },

  show: function () {
    this.setState({open: true})
  },
  hide: function () {
    this.setState({open: false})
  },

  mainPage: function () {
    return Object.keys(viewKeys).map(title => ({
      title: title,
      actions: viewKeys[title],
    }))
  },

  pluginsPage: function () {
    return this.props.plugins.reduce((sections, plugin) => {
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
    }, [])
  },

  render: function () {
    if (!this.state.open) {
      return <Toaster onClick={this.show}>
        Press ? for keyboard shortcuts
      </Toaster>
    }
    return <KeyboardPopup
      keys={this.props.keys}
      pages={{
        'Main': this.mainPage(),
        'Plugins': this.pluginsPage(),
      }}
      onClose={this.hide}/>
  },
})

var Toaster = React.createClass({
  getInitialState: function () {
    return {toasted: false}
  },
  componentDidMount: function () {
    setTimeout(() => this.setState({toasted: true}), 100);
  },
  render: function () {
    var cls = 'Toaster ' + (this.state.toasted ? 'Toaster-toasted' : '')
    return <div className={cls} {...this.props}>
      {this.props.children}
    </div>
  },
})

module.exports = KeyboardHelper
