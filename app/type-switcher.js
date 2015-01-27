
var React = require('treed/node_modules/react')
  , treed = require('treed/rx')

var TypeSwitcher = React.createClass({
  propTypes: {
    types: React.PropTypes.object,
  },

  getInitialState: function () {
    return {
      open: false,
    }
  },

  _toggleOpen: function () {
    this.setState({open: !this.state.open})
  },

  _onSelect: function (key) {
    this.setState({open: false})
    this.props.onChange(key)
  },

  render: function () {
    var keys = Object.keys(this.props.types)
      , current = this.props.type
    return <div className='TypeSwitcher'>
      <div
          onClick={this._toggleOpen}
          className={'TypeSwitcher_icon TypeSwitcher_icon-' + current}>
        {current}
      </div>
      {this.state.open &&
        <ul className='TypeSwitcher_dropdown'>
          {keys.map(key => key !== current &&
            <li className={'TypeSwitcher_item TypeSwitcher_item-' + key}
                onClick={this._onSelect.bind(null, key)}
                key={key}>
              {key}
            </li>)}
        </ul>}
    </div>
  }
})

module.exports = TypeSwitcher

