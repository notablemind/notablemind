/**
 * bootstrap the app into document.body
 */

var React = require('react')
var treed = require('../treed')
var renderToString = require('react-dom/server').renderToString

var files = require('../src/app/files')
require('../src/config')

module.exports = function (data, relPath, done) {
  console.log('require bakeddoc')
  var BakedDoc = require('../src/app/pages/baked')

  console.log('loading data')
  BakedDoc.load(data, (err, doc, file) => {
    if (err) return done(err)
    console.log('loaded data. rendering')

    var embedData = JSON.stringify(data).replace(/</g, '\u003c');
    var html = renderToString(<div/>) // doc
    console.log('rendered')

    done(null, `<!doctype html>
      <head>
        <meta charset="utf8">
        <title>${data[0].content} | Notablemind</title>
        <script src="${relPath}vendor/d3.js"></script>
        <script src="${relPath}vendor/vega.js"></script>
        <link rel="stylesheet" href="${relPath}build.css">
        <link rel="stylesheet" href="${relPath}baked.css">
        <link rel="stylesheet" href="${relPath}vendor/font-awesome-4.3.0/css/font-awesome.min.css">
        <link rel="stylesheet" href="${relPath}vendor/katex/katex.min.css">

        <script>
          var NM_BAKED_DATA=${embedData};
        </script>
        <script src="${relPath}baked.js"></script>
      </head>
      <body class="large">
        <div id="main">
          ${html}
        </div>
      </body>
    </html>`
    )
  })
}


