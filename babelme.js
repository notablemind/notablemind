var babel = require('babel-core')

module.exports = function(text) {
  return babel.transform(
    text,
    {presets:[
      require('babel-preset-es2015'),
      require('babel-preset-react'),
      require('babel-preset-stage-0'),
    ]}
  )
}
