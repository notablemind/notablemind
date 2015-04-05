
import classnames from 'classnames'

var React = require('react')
  , PT = React.PropTypes

var Modal = React.createClass({
  render: function () {
    return <div className={classnames('Modal-container', this.props.className)} {...this.props}>
      <div className='Modal_back' onClick={this.props.onClose}/>
      <div className='Modal_popup'>
        <div className='Modal_title'>{this.props.title}</div>
        <div className='Modal_close' onClick={this.props.onClose}>&times;</div>
        <div className='Modal_body'>
          {this.props.children}
        </div>
      </div>
    </div>
  }
})

module.exports = Modal



