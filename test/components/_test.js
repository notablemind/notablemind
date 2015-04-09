
var jsdom = require('jsdom')
require('babel/register')

jsdom.env('<html/>', function (err, window) {
  global.window = window
  global.performance = {
    memory: {
      usedJSHeapSize: null,
    },
    now: function () {return Date.now()}
  }
  for (var name in window) {
    if (name in global) continue;
    global[name] = window[name]
  }
  require('./tpl.js')
  global.run = function (setup, make) {
    global.window.run(setup, make, function (err, ticks, perf) {
      console.log('finished')
    })
  }

  global.ticks = global.window.ticks
  require('./doc-viewer.js')
})



