
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
  b.transform(transer(
    file => file.indexOf('.cfg.js') !== -1,
    transmutify
  ))
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

function transmutify(txt) {
  const config = txt.split(/^\b/mg).reduce((obj, part) => {
    const lines = part.trim().split('\n').map(m => m.trim()).filter(m => m)
    let name, val
    if (lines.length === 1) {
      const parts = lines[0].split(':')
      name = parts[0]
      val = parts.slice(1).join(':').trim()
    } else {
      if (lines[0].slice(-1) === ':') {
        name = lines[0].slice(0, -1)
        val = lines.slice(1).join('\n')
      } else {
        name = lines[0].split('(')[0]
        val = 'function ' + lines[0] + '{\n' + lines.slice(1).join('\n') + '\n}'
      }
    }
    obj[name] = val
    return obj
  }, {})
  // console.log(txt, config)

  const TPL = fs.readFileSync('./components/tpl.js')
    .toString('utf8')

  return transmute(TPL, config)
}

compile(
  './components/doc-viewer.cfg.js',
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

