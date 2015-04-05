
import React from 'react'
import classnames from 'classnames'

const {PropTypes: PT} = React

export default React.createClass({
  propTypes: {
    panes: PT.object,
  },
  getInitialState() {
    return {
      currentPane: Object.keys(this.props.panes)[0],
    }
  },
  render() {
    const {panes} = this.props
    const {currentPane} = this.state
    return <div className='Panes'>
      <ul className='Panes_left'>
        {Object.keys(panes).map(name =>
          <li onClick={() =>
            this.setState({currentPane: name})}
            className={classnames(
              'Panes_name',
              name === currentPane && 'Panes_name-selected'
          )}>
            {name}
          </li>)}
      </ul>
      <div className='Panes_main'>
        {panes[currentPane]()}
      </div>
    </div>
  },
})

