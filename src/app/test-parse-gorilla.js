
var fs = require('fs')
  , pg = require('./parse-gorilla')

var g = fs.readFileSync('../gorilla-test/awesome.clj').toString()

var s = pg.fromStr(g)
console.log(JSON.stringify(s, null, 2))
module.exports = s

