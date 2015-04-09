
var page = require('webpage').create()

page.onConsoleMessage = function (msg) {
  console.log('> ' + msg)
}

page.onError = function (msg, trace) {
  console.log('Error!')
  console.log(msg)
  console.log(trace)
}

page.onCallback = function (data) {
  console.log(JSON.stringify(data))
  phantom.exit(0)
}

page.open('http://localhost:8192/components/doc-viewer', function (status) {
  page.viewportSize = { width:1024, height:768 };
  // page.render('screenshot.png')
  page.evaluate(function () {
    window.afterRun = function (err, ticks, perf) {
      console.log('err', err)
      console.log('res', ticks)
      window.callPhantom({err: err, ticks: ticks})//, perf: perf})
    }
    console.log(document.title)
    console.log(document.body.innerHTML)
  })
  setTimeout(function () {
    console.log('Timeout!')
    phantom.exit(4)

  }, 30000)
})


