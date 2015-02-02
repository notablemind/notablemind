
var React = require('react')

var GistForm = React.createClass({
  getInitialState: function () {
    return {value: this.props.initialValue || ''}
  },
  componentWillReceiveProps: function (nextProps) {
    if (this.props.initialValue !== nextProps.initialValue) {
      this.setState({value: nextProps.initialValue})
    }
  },
  isValid: function () {
    return this.state.value.match(/^[\w-]+\/[0-9a-z]+$/)
  },
  onChange: function (e) {
    var val = e.target.value
    if (!val.trim()) return this.setState({value: val.trim()})
    var last = val.split('/').slice(-2).join('/')
    this.setState({value: last})
  },
  onSubmit: function () {
    if (!this.isValid()) return
    this.props.onSubmit(this.state.value)
  },
  render: function () {
    return <div className='GistForm'>
      Load from gist: 
      <input value={this.state.value}
        placeholder="username/id"
        onChange={(e) => this.setState({value: e.target.value})}
        onKeyDown={(e) => e.key === 'Return' ? this.onSubmit() : null}/>
      <button disabled={!this.isValid()} onClick={this.onSubmit}>Load Gist</button>
    </div>
  }
})

module.exports = GistForm
