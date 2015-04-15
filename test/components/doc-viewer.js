
const ticks = window.ticks || {add: () => {}}

import React from 'react/addons'
import {treedFromFile, initFormatters} from '../utils'

import DocViewer from '../../app/components/doc-viewer'
ticks.add('load:component')

import fixture from '../fixtures/tutorial-dump.nm.json'
ticks.add('load:fixture')
import Treed from 'treed/classy'
ticks.add('load:treed')

var itreed = require('itreed')
initFormatters()
ticks.add('load:itreed')

itreed.register(require('itreed/plugins/itreed-js'))
itreed.register(require('itreed/plugins/itreed-jupyter'))
ticks.add('load:ijs')

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
  require('../../treed-plugins/custom-css'),
  itreed({
    js: {
      server: {}
    }
  }),
]

ticks.add('load:plugins')

function setup(done) {
  console.log('treed from file')
  treedFromFile(Treed, fixture, plugins, pl, done)
}

function makeEl(err, {treed, file}) {
  treed.keyManager.listen(window)
  return <DocViewer
    saveWindowConfig={(a, b) => {b()}}
    keys={treed.keyManager}
    treed={treed}
    file={file}/>
}

console.log('hasrun:' + window.run)

window.run && window.run(setup, makeEl)

export {setup, makeEl}

