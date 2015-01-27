
var React = require('treed/node_modules/react')
  , PT = React.PropTypes

var Modal = React.createClass({
  propTypes: {
    title: PT.string.isRequired,
    onClose: PT.func.isRequired,
  },
  getInitialState: function () {
    return {}
  },
  onClose: function () {
    this.props.onClose(null, this.state)
  },
  onCancel: function () {
    this.props.onClose(new Error('Modal cancelled'))
  },
  set: function (name, value) {
    var up = {}
    up[name] = value
    this.setState(up)
  },
  setEvt: function (name, e) {
    var up = {}
    up[name] = e.target.value
    this.setState(up)
  },

  render: function () {
    var set = (name, evt) => {
      if (evt) {
        return this.setEvt.bind(null, name)
      }
      if ('string' === typeof name) {
        return this.set.bind(null, name);
      }
      this.setState(name)
    }
    return <div className='Modal_wrapper'>
      <div className='Modal_back' onClick={this.onCancel}/>
      <div className='Modal'>
        <div className='Modal_top'>
          {this.props.title}
        </div>
        <div className='Modal_body'>
          {this.props.body.call(this, this.state, set, this.onClose, this.onCancel)}
        </div>
      </div>
    </div>
  }
})

module.exports = Modal

