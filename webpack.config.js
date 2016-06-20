var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    './src/run',
  ],

  output: {
    path: path.join(__dirname, 'www'),
    filename: 'build.js',
    publicPath: '/',
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({ELECTRON: false}),
    new webpack.IgnorePlugin(/electron/),
  ],

  resolve: {
    alias: {
      itreed: path.join(__dirname, 'itreed'),
      treed: path.join(__dirname, 'treed'),
    },
  },

  module: {
    // Disable handling of unknown requires
    unknownContextRegExp: /$^/,
    unknownContextCritical: false,

    // Disable handling of requires with a single expression
    exprContextRegExp: /$^/,
    exprContextCritical: false,

    // Warn for every expression in require
    wrappedContextCritical: true,

    loaders: [{
      test: /\.json$/,
      loader: 'json',
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'itreed'),
        path.join(__dirname, 'treed'),
        path.join(__dirname, 'form'),
      ],
    }],
  },
}

