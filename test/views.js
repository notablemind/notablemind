
import React from 'react'
import fs from 'fs'

const components = fs.readdirSync(__dirname + '/components')
  .filter(name => name.match(/\.js$/) && name !== 'tpl.js')
  .map(name => name.slice(0, -('.js'.length)))

function tpl(text, vbls) {
  return text.replace(/\{[a-zA-Z-]+\}/g, (name) => {
    return vbls[name.slice(1, -1)] || ''
  })
}

function scripts(names) {
  return names.map(name =>
    `<script src="${name}"></script>`).join('\n')
}

export default {
  index(req, res, next) {
    if (req.url !== '/' && req.url !== '/index.html') return next()

    const TPL = fs.readFileSync(__dirname + '/body.tpl.html').toString('utf8')
    res.end(tpl(TPL, {
      TITLE: 'All Examples',
      BODY: React.renderToString(<div>
        <ul>
          {
            components.map(name => {
              return <li key={name}>
                <a href={'/components/' + name}>{name}</a>
              </li>
            })
          }
        </ul>
      </div>)
    }))
  },

  component(req, res, next) {
    const cname = req.url.slice(1)
    if (components.indexOf(cname) === -1) {
      console.log('unknown component', cname)
      return next()
    }
    const TPL = fs.readFileSync(__dirname + '/body.tpl.html').toString('utf8')
    res.end(tpl(TPL, {
      TITLE: 'Component: ' + cname,
      SCRIPTS: scripts([
        '/app/vendor.js',
        `/build/components/${cname}.js`,
      ])
    }))
    res.end('Hello')
  },

  docs(req, res, next) {
    const TPL = fs.readFileSync(__dirname + '/body.tpl.html').toString('utf8')
    const fixes = fs.readdirSync(__dirname + '/viewer').filter(name => name.match(/\.nm$/))
    if (req.url === '/') {
      return res.end(tpl(TPL, {
        TITLE: 'Load Documents',
        BODY: React.renderToString(<div>
          <ul>
            {fixes.map(path => <li key={path}>
              <a href={'/docs/' + path}>{path}</a>
            </li>)}
          </ul>
        </div>)
      }))
    }
    const name = req.url.slice(1)
    if (fixes.indexOf(name) === -1) return next()
    res.end(tpl(TPL, {
      TITLE: 'Document: ' + name,
      TOPJS: 'window.FIXTURE = ' + fs.readFileSync(__dirname + '/viewer/' + name).toString().replace(/</g, '\\u003C'),
      SCRIPTS: scripts([
        '/app/vendor.js',
        '/build/viewer.js',
      ])
    }))
  }
}

