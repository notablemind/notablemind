// Everything prefixed with an @ will be replaced
import {initFormatters, Ticker} from '../utils'

const ticks = new Ticker()
window.ticks = ticks

import React from 'react/addons'
ticks.add('load:react')
import MemPL from 'treed/pl/mem'

const pl = new MemPL()

window.run = run

function run(setup, makeEl) {
  setup(function () {
    const el = makeEl.apply(null, arguments)

    React.addons.Perf.start()
    ticks.add('setup')

    React.render(el, document.body, (err) => {
      ticks.add('render')

      ticks.show()
      React.addons.Perf.stop()
      //React.addons.Perf.getLastMeasurements()
    })

  })
}

