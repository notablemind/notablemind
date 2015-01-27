
var React = require('treed/node_modules/react')
  , cx = React.addons.classSet
  , PT = React.PropTypes

var DropDown = React.createClass({
  getInitialState: function () {
    return {open: false}
  },
  _toggle: function () {
    this.setState({open: !this.state.open})
  },
  render: function () {
    return <div className="DropDown">
      <span className="DropDown_title" onClick={this._toggle}>
        {this.props.blank}
      </span>
      {this.state.open &&
        <ul>
          {this.props.options.map(name =>
            <li onClick={this.props.onSelect.bind(null, name)}>
              {name}
            </li>)}
        </ul>}
    </div>
  },
})

module.exports = DropDown

