import {initFormatters, Ticker} from '../utils'

const ticks = new Ticker()
window.ticks = ticks

import React from 'react/addons'
ticks.add('load:react')

window.run = run

function run(setup, makeEl) {
  function done(err, ticks, perf) {
    if (window.afterRun) {
      return window.afterRun.apply(this, arguments)
    }
    if (err) {
      console.error('Error:', err)
      throw err
    }
    console.log(ticks, perf)
  }
  setup(function (err) {
    if (err) {
    }
    const el = makeEl.apply(null, arguments)

    React.addons.Perf.start()
    ticks.add('setup')

    React.render(el, document.body, (err) => {
      ticks.add('render')

      ticks.show()
      React.addons.Perf.stop()
      done(
        err,
        ticks.dump(),
        React.addons.Perf.getLastMeasurements()
      )
    })

  })
}

