
var babylon = require('babylon')

module.exports = function(text) {
  return babylon.parse(text, {
    sourceType: 'module',
    plugins: [
      "jsx",
      "flow",
      "asyncFunctions",
      "objectRestSpread",
      "decorators",
      "classProperties",
      "functionBind",
      "functionSet",
    ],
  })
}

