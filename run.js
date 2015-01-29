/**
 * bootstrap the app into document.body
 */

var React = require('react')
var treed = require('treed')

var files = require('./app/files')

// var App = require('./app')

window.run_require = require
window.React = React

// configuration things
var format = require('itreed/lib/plugin/format')

var formatters = [
  require('itreed/formatters/live'),
  require('itreed/formatters/live-button'),
  require('itreed/formatters/react'),
  require('itreed/formatters/vega'),
  require('itreed/formatters/dom'),
  require('itreed/formatters/latex'),
  // require('itreed/formatters/image'),
  require('itreed/formatters/list-like'),
  require('itreed/formatters/js'),
]

formatters.map(plugin => {
  if (plugin.display) {
    format.displayer(plugin.display, plugin.mime)
  }
  if (plugin.format) {
    format.formatter(plugin.format, plugin.mime)
  }
})

window.onload = function () {
  // React.renderComponent(App({}), document.body)
  var router = require('./app/router')

  require('react-router').run(router, function (Handler) {
    React.render(<Handler/>, document.body)
  });
}

