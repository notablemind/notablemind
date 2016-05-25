
import {render} from 'react-dom'
var React = require('react')
  , PT = React.PropTypes

var Modal = React.createClass({
  propTypes: {
    title: PT.string.isRequired,
    onClose: PT.func.isRequired,
    initialState: PT.object,
    buttons: PT.object,
    render: PT.func,
  },
  getInitialState: function () {
    return this.props.initialState
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

  _onChangeEvt: function (name, e) {
    var up = {}
    up[name] = e.target.value
    this.setState(up)
  },
  _onChange: function (name, value) {
    var up = {}
    up[name] = value
    this.setState(up)
  },

  render: function () {
    let style
    if (this.props.width) {
      style = {
        width: this.props.width + 'px',
        marginLeft: -this.props.width/2 + 'px'
      }
    }
    let set = (name, evt) => {
      if (evt) {
        return this.setEvt.bind(null, name)
      }
      if ('string' === typeof name) {
        return this.set.bind(null, name);
      }
      this.setState(name)
    }
    return <div className='Modal-container'>
      <div className='Modal_back' onClick={this.onCancel}/>
      <div className='Modal_popup' style={style}>
        <div className='Modal_title'>
          {this.props.title}
        </div>
        <div className='Modal_close' onClick={this.props.onClose}>&times;</div>
        <div className='Modal_body'>
          {this.props.renderBody.call(
            this,
            this.state,
            set,
            this.onClose,
            this.onCancel
          )}
        </div>
        {this.props.buttons ?
          <div className='Modal_buttons'>
            {Object.keys(this.props.buttons).map(name => 
              <button onClick={this.props.buttons[name].bind(this)}>
                {name}
              </button>)}
          </div> : null}
      </div>
    </div>
  }
})

Modal.show = function (config) {
  var parent = config.parent || document
    , node = document.createElement('div')
  parent.body.appendChild(node)

  var onClose = function (err) {
    node.parentNode.removeChild(node)
    config.done.apply(null, arguments)
  }

  render(
    <Modal
      initialState={config.initialState || {}}
      title={config.title || 'Modal'}
      onClose={onClose}
      width={config.width}
      buttons={config.buttons}
      renderBody={config.renderBody || config.body} />, node)
}

module.exports = Modal

