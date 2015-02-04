/**
 * bootstrap the app into document.body
 */

var React = require('react')
var treed = require('treed')

var files = require('../app/files')

// configuration things
var format = require('itreed/lib/plugin/format')

var formatters = [
  require('itreed/formatters/live'),
  require('itreed/formatters/live-button'),
  require('itreed/formatters/react'),
  require('itreed/formatters/vega'),
  require('itreed/formatters/dom'),
  require('itreed/formatters/latex'),
  // require('itreed/formatters/image'),
  require('itreed/formatters/list-like'),
  require('itreed/formatters/js'),
]

formatters.map(plugin => {
  if (plugin.display) {
    format.displayer(plugin.display, plugin.mime)
  }
  if (plugin.format) {
    format.formatter(plugin.format, plugin.mime)
  }
})


module.exports = function (data, relPath, done) {
  console.log('require bakeddoc')
  var BakedDoc = require('../app/pages/baked')

  console.log('loading data')
  BakedDoc.load(data, (err, doc) => {
    if (err) return done(err)
    console.log('loaded data. rendering')

    var embedData = JSON.stringify(data).replace(/</g, '\u003c');
    var html = React.renderToString(doc)

    done(null, `<!doctype html>
      <head>
        <meta charset="utf8">
        <title>${data.title} | Notablemind</title>
        <script src="${relPath}vendor/d3.js"></script>
        <script src="${relPath}vendor/vega.js"></script>
        <link rel="stylesheet" href="${relPath}build.css">
        <link rel="stylesheet" href="${relPath}vendor/font-awesome-4.3.0/css/font-awesome.min.css">
        <link rel="stylesheet" href="${relPath}vendor/katex/katex.min.css">


        <script>
          var NM_BAKED_DATA=${embedData};
        </script>
        <script src="${relPath}vendor.js"></script>
        <script src="${relPath}baked.js"></script>
      </head>
      <body>
        <div id="main">
          ${html}
        </div>
      </body>
    </html>`
    )
  })
}


