
var parseGorilla = require('./gorilla')
var ipython = require('./ipython')
var python = require('./python')
var js = require('./javascript')
var markdown = require('./markdown')

module.exports = {
  markdown: {
    ext: 'md',
    mime: 'text/plain',
    strFromTrees: markdown.dump,
    treeFromStr: markdown.parse,
  },
  notablemind: {
    ext: 'nm',
    mime: 'application/json',
    strFromTrees: function (trees) {
      return JSON.stringify(trees, null, 2)
    },
    treeFromStr: function (str) {
      try {
        var trees = JSON.parse(str)
      } catch (e) {
        return new Error("Unable to parse file. Are you sure it's the right format?")
      }
      if (!Array.isArray(trees) && trees.content && trees.children) {
        trees = [trees]
      }
      if (!Array.isArray(trees) || !trees.length || !trees[0].content || !trees[0].children) {
        return new Error("This doesn't look like the right format.")
      }
      return trees
    },
  },
  ipython: {
    ext: 'ipynb',
    mime: 'application/json',
    strFromTrees: ipython.toStr,
    treeFromStr: ipython.fromStr,
  },
  python: {
    ext: 'py',
    mime: 'text/python',
    strFromTrees: python.toStr,
    treeFromStr: python.fromStr,
  },
  javascript: {
    ext: 'js',
    mime: 'text/javascript',
    strFromTrees: js.toStr,
    treeFromStr: js.fromStr,
  },
  gorilla: {
    ext: 'clj',
    mime: 'text/clojure',
    strFromTrees: parseGorilla.toStr,
    treeFromStr: parseGorilla.fromStr,
  },
  formats: [
    ['notablemind', 'Notablemind (.nm)'],
    ['ipython', 'IPython (.ipynb)'],
    ['gorilla', 'Gorilla (.clj)'],
    ['python', 'Python (.py)'],
    ['javascript', 'Javascript (.js)'],
    ['markdown', 'Markdown (.md)'],
    // latex: 'Latex (.tx)',
  ],
  exts: {
    'md': 'markdown',
    'nm': 'notablemind',
    'py': 'python',
    'ipynb': 'ipython',
    'clj': 'gorilla',
    'js': 'javascript',
  },
  detect: function (filename) {
    var parts = filename.split('.')
      , ext = parts[parts.length - 1]
      , fromExt = module.exports.exts[ext]
    if (fromExt) return fromExt
    // TODO: content based
  },
}

