/** @jsx React.DOM */

var BackendDropdown = module.exports = React.createClass({
  displayName: 'BackendDropdown',
  getDefaultProps: function () {
    return {
      current: '',
      backs: {},
      onChange: function (back, type) {
        console.log('changing to backend', back, type)
      }
    }
  },
  render: function () {
    var backs = this.props.backs
      , keys = Object.keys(backs)
      , current = this.props.current
      , cback = this.props.backs[current]

      , onChange = this.onChange
      
    return (
      <div className='backend-dropdown'>
        <div className='backend-dropdown_current'>
          <i className={'fa fa-' + cback.icon}/>
          {cback.shortName}
        </div>
        <ul className='backend-dropdown_items'>
          {
            keys.map(function (key) {
              if (key === current) return
              var back = backs[key]
              return (
                <li className='backend-dropdown_item'
                  key={key}
                  onClick={onChange.bind(null, key)}>
                  <i className={'fa fa-' + back.icon}/>
                  {back.shortName}
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
})

// vim: set tabstop=2 shiftwidth=2 expandtab:

