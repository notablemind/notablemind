
var page = require('webpage').create()

page.onConsoleMessage = function (msg) {
  console.log('> ' + msg.trim())
}

page.onError = function (msg, trace) {
  console.log('Error!')
  console.log(msg)
  console.log(JSON.stringify(trace))

  page.render('screenshot.png')
  console.log('Screenshot saved to ./screenshot.png')
  phantom.exit(-5)
}

page.onCallback = function (data) {
  console.log('Got data')
  console.log(JSON.stringify(data))
  phantom.exit(0)
}

page.open('http://localhost:8192/components/doc-viewer', function (status) {
  page.viewportSize = { width:1024, height:768 };
  // page.render('screenshot.png')
  page.evaluate(function () {
    window.afterRun = function (err, ticks, perf) {
      if (err) console.log('err', err)
      window.callPhantom({err: err, ticks: ticks})//, perf: perf})
    }
    console.log(document.title)
    console.log(document.body.innerHTML)
  })
  setTimeout(function () {
    // console.log(page.renderBase64('PNG'))
    page.render('screenshot.png')
    console.log('Timeout!')
    phantom.exit(0)
  }, 30000)
})


