
export {Ticker, initFormatters, treedFromFile}

function Ticker() {
  this.ticks = []
  if (window.performance && !window.performance.memory) {
    window.performance.memory = {usedJSHeapSize: -1}
  }
  this.add = function (name) {
    if (!window.performance) {
      return
    }
    console.log(`Tick ${name} ${window.performance.now()}`)
    this.ticks.push({
      name: name,
      time: window.performance.now(),
      usedMem: window.performance.memory.usedJSHeapSize,
      totalMem: window.performance.memory.totalJSHeapSize,
    })
  }
  this.show = function () {
    for (let i=1; i<this.ticks.length; i++) {
      console.log(this.ticks[i].name, this.ticks[i].time - this.ticks[i-1].time)
    }
  }
  this.dump = function () {
    return this.ticks
  }
  if (window.firstDOM) {
    this.ticks.push({
      name: 'firstDOM',
      time: window.firstDOM,
    })
  }
  if (window.afterStyle) {
    this.ticks.push({
      name: 'afterStyle',
      time: window.afterStyle,
    })
  }
  this.add('start')
}

function initFormatters() {
  // configuration things
  const format = require('itreed/lib/format')

  const formatters = [
    require('itreed/formatters/live'),
    require('itreed/formatters/live-button'),
    require('itreed/formatters/react'),
    require('itreed/formatters/vega'),
    require('itreed/formatters/table'),
    require('itreed/formatters/dom'),
    require('itreed/formatters/latex'),
    require('itreed/formatters/list-like'),
    require('itreed/formatters/js'),
  ]

  formatters.map(plugin => {
    if (plugin.display) {
      format.displayer(plugin.display, plugin.mime)
    }
    if (plugin.format) {
      format.formatter(plugin.format, plugin.mime)
    }
  })
}

function treedFromFile(Treed, data, plugins, pl, done) {
  const file = {}
  for (let name in data) {
    if (name === 'root') continue;
    file[name] = data
  }

  const treed = new Treed({plugins})
  treed.initStore(data.root, {pl}).then(store => {
    console.log('store initialized')
    setTimeout(_ => {
      done(null, {treed, file})
    })
  }).catch(err => {
    console.log('failed to initialize store: ' + err.message)
    console.log(err.stack)
    setTimeout(_ => {
      done(err, {})
    })
  })
}

