
var webpack = require('webpack')
var config = require('./webpack.config.js')

config.target = 'electron'

config.plugins = [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({ELECTRON: true}),
]

module.exports = config;
