/**
 * bootstrap the app into document.body
 */

const React = require('react')

window.runRequire = require
window.React = React

// configuration things
const format = require('itreed/lib/plugin/format')

const formatters = [
  require('itreed/formatters/live'),
  require('itreed/formatters/live-button'),
  require('itreed/formatters/react'),
  require('itreed/formatters/vega'),
  require('itreed/formatters/table'),
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
  const router = require('./app/router')

  require('react-router').run(router, function (Handler) {
    React.render(<Handler/>, document.body)
  });
}

