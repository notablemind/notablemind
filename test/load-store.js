
global.navigator = {}
global.document = {createElement: () => ({
  setAttribute: () => {}
})}
global.vm = require('vm')
global.window = {
  addEventListener: () => {}
}

import React from 'react'
import {treedFromFile} from './utils'

import DocViewer from '../app/components/doc-viewer'

import fixture from './fixtures/tutorial-dump.nm.json'
import Treed from 'treed/classy'

var itreed = require('itreed')

import MemPL from 'treed/pl/mem'

const pl = new MemPL()

itreed.register(require('itreed/plugins/itreed-js'))
itreed.register(require('itreed/plugins/itreed-jupyter'))

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
  itreed({
    js: {
      server: {}
    }
  }),
]

console.log('start')
treedFromFile(Treed, fixture, plugins, pl, (err, {treed, file}) => {
  if (err) {
    throw err
  }
  console.log('Ready!')
  process.exit(0)
})

