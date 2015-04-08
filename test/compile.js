
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

compile(
  [
    './components/tpl.js',
    './components/doc-viewer.js',
  ],
  './build/components/doc-viewer.js',
  true)

compile('./viewer/index.js', './build/viewer.js', true)

