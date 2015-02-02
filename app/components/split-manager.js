
var React = require('react')
  , Splitter = require('./splitter')
  , PT = React.PropTypes

function r(){
  for (var a = ''; a.length < 5; a += 'abcdefg'[parseInt(Math.random() * 7)]);
  return a;
}

function cloneShallow(s) {
  var o = {}
  for (var a in s) {
    o[a] = s[a]
  }
  return o
}

function r(){
  for (var a = ''; a.length < 5; a += 'abcdefg'[parseInt(Math.random() * 7)]);
  return a;
}

function cloneShallow(s) {
  var o = {}
  for (var a in s) {
    o[a] = s[a]
  }
  return o
}

var SplitManager = React.createClass({
  propTypes: {
    config: PT.object,
    comp: PT.element,
    getNew: PT.func,
    onRemove: PT.func,
    onChange: PT.func,
    cprops: PT.object,
  },

  statics: {
    split: function (pos, orient, config, getNew) {
      pos = pos.slice()
      if (config.leaf) {
        return {
          leaf: false,
          value: {
            orient,
            first: {leaf: true, value: config.value},
            second: {leaf: true, value: getNew(config.value)}
          }
        }
      }
      var config = config
      var last = pos.pop()
      var line = pos.reduce(function (config, i) {
        return config[i].value = cloneShallow(config[i].value)
      }, config.value)
      line[last] = {
        leaf: false,
        ratio: .5,
        value: {
          orient,
          first: {leaf: true, value: line[last].value},
          second: {leaf: true, value: getNew(line[last].value)}
        }
      }
      return config
    },

    remove: function (pos, config) {
      pos = pos.slice()
      if (config.leaf) return
      var removed
      if (pos.length === 1) {
        removed = config.value[pos[0]].value
        config = config.value[pos[0] === 'first' ? 'second' : 'first']
      } else {
        leaf = false
        config = cloneShallow(config)
        var last = pos.pop()
          , sec = pos.pop()
        var line = pos.reduce(function (config, i) {
          return config[i].value = cloneShallow(config[i].value)
        }, config.value)
        removed = line[sec].value[last].value
        line[sec] = line[sec].value[last == 'first' ? 'second' : 'first']
      }
      return {removed, config}
    }
  },

  getDefaultProps: function () {
    return {
      getNew: function (old) {return r()}
    }
  },

  changeRatio: function (pos, ratio, done) {
    var config = this.props.config
    var line = pos.reduce(function (config, i) {
      return config[i].value = cloneShallow(config[i].value)
    }, config.value)
    line.ratio = ratio
    this.props.onChange(config)
    done()
  },

  split: function (pos, orient) {
    var config = SplitManager.split(pos, orient, this.props.config, this.props.getNew)
    this.props.onChange(config)
  },

  remove: function (pos) {
    var result = SplitManager.remove(pos, this.props.config)
    if (!result) return
    this.props.onRemove(result.removed)
    this.props.onChange(result.config)
  },

  render: function () {
    var cprops = cloneShallow(this.props.cprops)
    cprops.onSplit = this.split
    cprops.onRemove = this.remove
    cprops.onChangeRatio = this.changeRatio
    return <Splitter 
      config={this.props.config}
      comp={this.props.comp}
      onChangeRatio={this.changeRatio}
      cprops={cprops}/>
  }
});

module.exports = SplitManager
