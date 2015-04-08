
import React from 'react/addons'
import {treedFromFile} from '../utils'

import DocViewer from '../../app/components/doc-viewer'
ticks.add('load:component')

import fixture from '../fixtures/tutorial-dump.nm.json'
ticks.add('load:fixture')
import Treed from 'treed/classy'
ticks.add('load:treed')

var IJS = require('itreed/lib/kernels/js')
ticks.add('load:ijs')
var itreed = require('itreed')
ticks.add('load:itreed')

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
    type: 'ijs',
    language: 'javascript',
    remote: false,
    title: 'Javascript',
    kernel: IJS,
  }),
]

ticks.add('load:plugins')


function setup(done) {
  treedFromFile(Treed, fixture, plugins, pl, done)
}

function makeEl(err, {treed, file}) {
  return <DocViewer
    saveWindowConfig={(a, b) => {b()}}
    keys={treed.keyManager}
    treed={treed}
    file={file}/>
}

run(setup, makeEl)

