var webpack = require('webpack');
var path = require('path');

module.exports = require('./webpack.config.js')
module.exports.devtool = null
module.exports.node = {
  fs: 'empty',
  http: 'empty',
  https: 'empty',
}
module.exports.entry = './bin/client'
module.exports.output.filename = 'baked.js'
