
var React = require('treed/node_modules/react')
  , PT = React.PropTypes
  , SOURCES = require('./sources')

var SourceSelector = React.createClass({
  propTypes: {
    file: PT.object.required,
    setState: PT.func.required,
  },

  render: function () {
    return <div className='SaveSelector'>
      <div className='SaveSelector_top'>
        <span className='SaveSelector_icon'>
        </span>
        <span className='SaveSelector_drop'>
        </span>
      </div>
      {this.state.open && <ul className='SaveSelector_list'>
        {Object.keys(SAVERS).map(key =>
          (SOURCES[key].enabled ? SOURCES[key].enabled(key) : true) &&
          <li className={'SaveSelector_li SaveSelector_li-' + key}>
            <i className={'icon icon-' + SAVERS[key].icon}/>
            {SAVERS[key].title}
          </li>)}
      </ul>}
    </div>
  },
})

module.exports = SourceSelector
