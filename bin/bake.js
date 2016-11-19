#!/usr/bin/env node

var jsdom = require('jsdom')
  , fs = require('fs')
  , path = require('path')

var program = require('commander')

program
  .usage('./bin/bake.js [options]')
  .option('-i, --infile <infile>', "The path of the NotableMind file")
  .option('-o, --outfile <outfile>', "The output path")
  .option('-r, --relative-path [relpath]', 'The relative path to the nm assets, default ""')
  .version('1.0.0')
  .parse(process.argv);

var outFile = path.join(process.cwd(), program.outfile)
  , inFile = program.infile[0] === '/' ? program.infile : path.join(process.cwd(), program.infile)
  , relPath = program.relativePath || ''

if (!fs.existsSync(path.dirname(outFile))) {
  console.error('Output directory doesn\'t exist')
  process.exit(1)
}

const preprocess = data => {
  let total = data.length
  data.forEach(item => {
    // if (item.collapsed) item.collapsed = false
    if (item.disabled) item.disabled = false
    if (item.children) {
      const num = preprocess(item.children)
      item.childCount = num
      total += num
    }
  })
  return total
}

jsdom.env('<html><body><div></div></body></html>', function (err, window) {

  // this is all needed so that codemirror won't complain
  global.window = window
  global.parent = window
  global.document = window.document
  global.location = window.location
  global.navigator = window.navigator
  global.ELECTRON = false

  require('babel-core/register')({
    presets: ["react", "es2015", "stage-0"],
    plugins: [
      [ "babel-plugin-webpack-alias", { "config": path.join(__dirname, "webpack.bake.js") } ]
    ]
  })

  var data = fs.readFileSync(inFile, {encoding: 'utf8'})
  data = JSON.parse(data)

  preprocess(data)

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

