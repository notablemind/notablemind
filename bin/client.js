/**
 * bootstrap the app into document.body
 */

import {render} from 'react-dom'
var React = require('react')
var treed = require('treed')

var files = require('../src/app/files')
require('../src/config')

// window.run_require = require
window.React = React

window.addEventListener('DOMContentLoaded', () => {
  var BakedDoc = require('../src/app/pages/baked')

  BakedDoc.load(window.NM_BAKED_DATA, (err, doc) => {
    if (err) return done(err)

    render(doc, document.body.firstElementChild)
  })
})



