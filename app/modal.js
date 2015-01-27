
var React = require('treed/node_modules/react')
  , PT = React.PropTypes

var Modal = React.createClass({
  render: function () {
    return this.transferPropsTo(<div className='Modal-container'>
      <div className='Modal_back' onClick={this.props.onClose}/>
      <div className='Modal_popup'>
        <div className='Modal_title'>{this.props.title}</div>
        <div className='Modal_close' onClick={this.props.onClose}>&times;</div>
        <div className='Modal_body'>
          {this.props.children}
        </div>
      </div>
    </div>)
  }
})

module.exports = Modal



