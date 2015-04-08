
import fs from 'fs'

import browserify from 'browserify'
import watchify from 'watchify'
import external from '../external'
import through from 'through'

function compile(infile, outfile, watch) {

  const b = browserify({
    cache: {},
    packageCache: {},
    debug: true,
  })

  b.external(external)
  b.transform('babelify', {experimental: true})
  b.transform('envify')
  b.add(infile)

  let m = b

  if (watch) {
    const w = watchify(b)
    w.on('update', () => {
      console.log(infile, 'updating')
      w.bundle((err, buf) => {
        console.log(infile, 'done updating')
        fs.writeFileSync(outfile, buf)
      })
    })
    .on('log', log => {
      console.log(infile, 'Watchify:', log)
    })

    m = w
  }

  console.log(infile, 'initial')
  m.bundle((err, buf) => {
    if (err) {
      console.log(infile, "ERROR", err)
      console.log(err.stack)
      return
    }
    console.log(infile, 'done initial')
    fs.writeFileSync(outfile, buf)
  })
}

function transmute(tpl, config) {
  return tpl.replace(/@[A-Za-z]+/g, name => {
    name = name.slice(1)
    let res = config[name]
    if (!res) {
      throw new Error('Unknown variable: ' + name)
    }
    return res
  })
}

function transer(check, trans) {
  return function (file) {
    if (!check(file)) return through()
    let buf = ''
    return through(write, end)

    function write(txt) {
      buf += txt
    }
    function end() {
      this.queue(trans(buf))
      this.queue(null)
    }
  }
}

compile(
  [
    './components/tpl.js',
    './components/doc-viewer.js',
  ],
  './build/components/doc-viewer.js',
  true)

compile('./viewer/index.js', './build/viewer.js', true)

/*
compile({
  id: 'hello.js',
  file: 'hello.js',
  source: 'console.log("hello")',
  entry: true,
}, './tst.js')
*/

