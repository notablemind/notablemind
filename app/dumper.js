
var React = require('treed/node_modules/react/addons')
  , cx = React.addons.classSet
  , PT = React.PropTypes

var Dumper = React.createClass({
  getInitialState: function () {
    return {
      dumping: false,
      dumpURL: null,
    }
  },

  _onExport: function () {
    this.setState({dumping: true})
    this.props.files.list(files => {
      var tasks = files.map(file =>
        this.props.files.dump.bind(null, file))
      async.parallel(tasks, (err, results) => {
        var blob = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'})
        this.setState({
          dumpURL: URL.createObjectURL(blob)
        })
      })
    })
  },

  render: function () {
    if (this.state.dumping) {
      if (this.state.dumpURL) {
        return <a download="notablemind-dump.json" href={this.state.dumpURL}>Click to download</a>
      } else {
        return <span>Processing...</span>
      }
    } else {
      return <a style={{cursor:'pointer',color: 'blue'}}
        onClick={this._onExport}>Dump</a>
    }
  },
})

module.exports = Dumper

