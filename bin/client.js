/**
 * bootstrap the app into document.body
 */

import {render} from 'react-dom'
var React = require('react')
var treed = require('treed')

var files = require('../app/files')

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


window.addEventListener('DOMContentLoaded', () => {
  var BakedDoc = require('../app/pages/baked')

  BakedDoc.load(window.NM_BAKED_DATA, (err, doc) => {
    if (err) return done(err)

    render(doc, document.body.firstElementChild)
  })
})



