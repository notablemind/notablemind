
var React = require('react/addons')
  , PT = React.PropTypes
  , async = require('async')

var Dumper = React.createClass({
  propTypes: {
    files: PT.object,
  },

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
        if (err) {
          return console.warn('Failed to export files', err) // TODO UI?
        }
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
      return <a style={{cursor: 'pointer', color: 'blue'}}
        onClick={this._onExport}>Dump</a>
    }
  },
})

module.exports = Dumper

