#!/usr/bin/env node

var jsdom = require('jsdom')
  , fs = require('fs')
  , path = require('path')

var program = require('commander')

program
  .usage('demobox [options]')
  .option('-i, --infile <infile>', "The path of the NotableMind file")
  .option('-o, --outfile <outfile>', "The output path")
  .option('-r, --relative-path [relpath]', 'The relative path to the nm assets, default ""')
  .version('1.0.0')
  .parse(process.argv);

var outFile = path.join(process.cwd(), program.outfile)
  , inFile = path.join(process.cwd(), program.infile)
  , relPath = program.relativePath || ''

if (!fs.existsSync(path.dirname(outFile))) {
  console.error('Output directory doesn\'t exist')
  process.exit(1)
}


jsdom.env('<html><body><div></div></body></html>', function (err, window) {

  // this is all needed so that codemirror won't complain
  global.window = window
  global.parent = window
  global.document = window.document
  global.location = window.location
  global.navigator = window.navigator

  require('babel/register')

  var data = fs.readFileSync(inFile, {encoding: 'utf8'})
  data = JSON.parse(data)

  console.log('Setup finished\n')
  require('./server')(data, relPath, function (err, text) {
    if (err) {
      console.log('failed', err)
      process.exit(1)
    }
    console.log('\n\nFinished!\n')
    fs.writeFileSync(outFile, text, {encoding: 'utf8'})
  })
})

