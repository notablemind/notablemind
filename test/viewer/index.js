import {treedFromFile, initFormatters, Ticker} from '../utils'

const ticks = new Ticker()

import {render} from 'react-dom'
import React from 'react/addons'
ticks.add('load:react')

import Treed from 'treed/classy'
import MemPL from 'treed/pl/mem'
ticks.add('load:treed')
import DocViewer from '../../app/components/doc-viewer'
ticks.add('load:component')

var IJS = require('itreed/plugins/itreed-js')
ticks.add('load:ijs')
var itreed = require('itreed')
ticks.add('load:itreed')

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

const pl = new MemPL()

treedFromFile(Treed, FIXTURE, plugins, pl, (err, {treed, file}) => {

  treed.keyManager.listen(window)
  const el = <DocViewer
    saveWindowConfig={(a, b) => {b()}}
    keys={treed.keyManager}
    treed={treed}
    file={file}/>

  React.addons.Perf.start()
  ticks.add('treedFromFile')

  render(el, document.body, (err) => {
    ticks.add('render')

    ticks.show()
    React.addons.Perf.stop()
    //React.addons.Perf.getLastMeasurements()
  })
})


