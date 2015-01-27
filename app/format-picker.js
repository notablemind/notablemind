
var React = require('treed/node_modules/react')
  , PT = React.PropTypes

var FormatPicker = React.createClass({
  propTypes: {
    formats: PT.array.isRequired,
    format: PT.string.isRequired,
    onChange: PT.func.isRequired,
  },

  render: function () {
    return <ul className='FormatPicker'>
      {this.props.formats.map((format) =>
          <li className={'FormatPicker_item' + (format[0] === this.props.format ? ' FormatPicker_item-selected' : '')}
              onClick={this.props.onChange.bind(null, format[0])}>{format[1]}</li>)}
    </ul>
  }
})

module.exports = FormatPicker
