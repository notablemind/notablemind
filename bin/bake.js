#!/usr/bin/env node

var jsdom = require('jsdom')
  , fs = require('fs')

jsdom.env('<html><body><div></div></body></html>', function (err, window) {
  global.window = window
  global.document = window.document
  global.location = window.location
  global.parent = window

  global.navigator = window.navigator
  require('node-jsx').install({harmony: true, extension: '.js'})
  var path = require('path')

  var data = fs.readFileSync(path.join(process.cwd(), process.argv.slice(-1)[0]), {encoding: 'utf8'})
  data = JSON.parse(data)

  console.log('Setup finished')
  require('./server')(data, function (err, text) {
    if (err) {
      console.log('failed', err)
      process.exit(1)
    }
    console.log('\n\nFinished!\n')
    fs.writeFileSync('./www/out.html', text, {encoding: 'utf8'})
  })
})
