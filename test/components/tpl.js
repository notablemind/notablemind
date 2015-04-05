// Everything prefixed with an @ will be replaced
import {treedFromFile, initFormatters, Ticker} from '../utils'

const ticks = new Ticker()

import React from 'react/addons'
ticks.add('load:react')

@ExtraImports
import @ComponentName from '../../app/components/@ComponentPath'
ticks.add('load:component')

@ExtraSetup

const pl = new MemPL()

@Setup
@MakeEl

Setup(function () {
  const el = MakeEl.apply(null, arguments)

  React.addons.Perf.start()
  ticks.add('setup')

  React.render(el, document.body, (err) => {
    ticks.add('render')

    ticks.show()
    React.addons.Perf.stop()
    //React.addons.Perf.getLastMeasurements()
  })

})

