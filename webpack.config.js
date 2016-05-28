var webpack = require('webpack');
var path = require('path');

module.exports = {
  // devtool: 'eval',
  devtool: 'source-map',
  entry: [
    // 'webpack-hot-middleware/client',
    './src/run',
  ],

  output: {
    path: path.join(__dirname, 'www'),
    filename: 'build.js',
    publicPath: '/static/',
  },

  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],

  resolve: {
    alias: {
      itreed: path.join(__dirname, 'itreed'),
      treed: path.join(__dirname, 'treed'),
    },
  },

  node: {
    fs: 'empty',
    net: 'empty',
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
      //include: path.join(__dirname, 'cached'),
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'itreed'),
        path.join(__dirname, 'treed'),
      ],
      /*query: {
        env: {
          development: {
            plugins: [
              'transform-runtime',
              /*
              ['react-transform', {
                transforms: [{
                  transform: "react-transform-hmr",
                  imports: ["react"],
                  locals: ["module"]
                }, {
                  transform: "react-transform-catch-errors",
                  imports: ["react", "redbox-react"]
                }]
              }]
              * /
            ]
          }
      }
        }*/
    }],
  },
}

