
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

var SplitManager = React.createClass({
  propTypes: {
    config: PT.object,
    comp: PT.element,
    getNew: PT.func,
    onChange: PT.func,
    cprops: PT.object,
  },

  getDefaultProps: function () {
    return {
      getNew: function (old) {return r()}
    }
  },

  split: function (pos, orient) {
    pos = pos.slice()
    if (this.props.config.leaf) {
      return this.props.onChange({
        leaf: false,
        value: {
          orient,
          first: {leaf: true, value: this.props.config.value},
          second: {leaf: true, value: this.props.getNew(this.props.config.value)}
        }
      })
    }
    var config = this.props.config
    var last = pos.pop()
    var line = pos.reduce(function (config, i) {
      return config[i].value = cloneShallow(config[i].value)
    }, config.value)
    line[last] = {
      leaf: false,
      value: {
        orient,
        first: {leaf: true, value: line[last].value},
        second: {leaf: true, value: this.props.getNew(line[last].value)}
      }
    }
    this.props.onChange(config)
  },

  remove: function (pos) {
    pos = pos.slice()
    if (this.props.config.leaf) return
    if (pos.length === 1) {
      config = this.props.config.value[pos[0] === 'first' ? 'second' : 'first']
    } else {
      leaf = false
      config = cloneShallow(this.props.config)
      var last = pos.pop()
        , sec = pos.pop()
      var line = pos.reduce(function (config, i) {
        return config[i].value = cloneShallow(config[i].value)
      }, config.value)
      line[sec] = line[sec].value[last == 'first' ? 'second' : 'first']
    }
    this.props.onChange(config)
  },

  render: function () {
    var cprops = cloneShallow(this.props.cprops)
    cprops.onSplit = this.split
    cprops.onRemove = this.remove
    return <Splitter 
      config={this.props.config}
      comp={this.props.comp}
      cprops={cprops}/>
  }
});

module.exports = SplitManager
