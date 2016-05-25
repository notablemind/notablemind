import {initFormatters, Ticker} from '../utils'

const ticks = new Ticker()
window.ticks = ticks

import {render} from 'react-dom'
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
      return done(err)
    }
    const el = makeEl.apply(null, arguments)

    React.addons.Perf.start()
    ticks.add('setup')

    const div = document.createElement('div')
    document.body.appendChild(div)

    render(el, div, (err) => {
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

