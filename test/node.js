
global.navigator = {}
global.document = {createElement: () => ({
  setAttribute: () => {}
})}
global.window = {
  addEventListener: () => {}
}

import React from 'react/addons'
import {treedFromFile} from './utils'

import DocViewer from '../app/components/doc-viewer'

import fixture from './fixtures/tutorial-dump.nm.json'
import Treed from 'treed/classy'

var IJS = require('itreed/lib/kernels/js')
var itreed = require('itreed')

import MemPL from 'treed/pl/mem'


const pl = new MemPL()

var plugins = [
  require('treed/plugins/undo'),
  require('treed/plugins/todo'),
  require('treed/plugins/image'),
  require('treed/plugins/types'),
  require('treed/plugins/collapse'),
  require('treed/plugins/clipboard'),
  require('treed/plugins/lists'),
  require('treed/plugins/rebase'),
  require('../treed-plugins/custom-css'),
]

console.log('start')
treedFromFile(Treed, fixture, plugins, pl, (err, {treed, file}) => {
  if (err) {
    throw err
  }
  console.log('treed from file')
  // treed.keyManager.listen(window)
  const el = <DocViewer
    saveWindowConfig={(a, b) => {b()}}
    keys={treed.keyManager}
    treed={treed}
    file={file}/>
  const str = React.renderToString(el)
  console.log('rendered')
  process.exit(0)
})


