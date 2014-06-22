/** @jsx React.DOM */

var VIEW_TYPES = require('./view-types');

var ViewSelector = module.exports = React.createClass({
  displayName: 'ViewSelector',
  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
  },
  items: function () {
    return Object.keys(VIEW_TYPES).map(function (name) {
      var obj = VIEW_TYPES[name]
      return <button className='vs-btn' onClick={
        this.props.onChange.bind(null, name)
      }>
        <i className={'fa fa-' + obj.icon}/>
      </button>
    }.bind(this))
  },
  render: function () {
    return <div className='vs'>
      {this.items()}
    </div>
  }
});

