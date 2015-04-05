
import fs from 'fs'

import browserify from 'browserify'
import watchify from 'watchify'
import external from '../external'

import through from 'through'

const TPL = fs.readFileSync('./components/tpl.js')
  .toString('utf8')

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

const pth = './components/doc-viewer.js'

/*
import config from './components/doc-viewer.t.js'

const entry = {
  id: pth,
  file: pth,
  source: transmute(TPL, config),
  entry: true,
}
*/
const entry = './components/doc-viewer.cfg.js'

const outfile = './tst.js'

const b = browserify({
  cache: {},
  packageCache: {},
  debug: true,
})

b.external(external)

b.transform(transer(function check(file) {
  return (file.indexOf('.cfg.js') !== -1)
}, function trans(txt) {
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
  console.log(txt, config)

  return transmute(TPL, config)
}))

b.transform('babelify', {experimental: true})
b.transform('envify')
b.add(entry)

b.bundle((err, buf) => {
  if (err) {
    console.log("ERROR", err)
    throw err
    return
  }
  console.log('done initial')
  fs.writeFileSync(outfile, buf)
})


