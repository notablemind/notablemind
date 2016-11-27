
import SearchBody from './search-body'
import {toReg} from './search-utils'
import React from 'react'

const {PropTypes: PT} = React

var SearchPopper = React.createClass({
  propTypes: {
    matchItems: PT.func.isRequired,
    onSelect: PT.func.isRequired,
    onClose: PT.func.isRequired,
  },

  getInitialState: function () {
    return {
      needle: '',
    }
  },

  componentDidMount: function () {
    this.refs.input.focus()
  },

  onChange: function (e) {
    var needle = e.target.value
    this.setState({
      needle: needle,
    })
  },

  onKeyDown: function (e) {
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      this.refs.list.handleEnter(!!e.altKey)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.refs.list.handleGoUp()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.refs.list.handleGoDown()
    }
    if (e.key === 'Escape') {
      this.props.onClose()
    }
  },

  render: function () {
    return <div className='SearchPopper'>
      <SearchBody
        ref="list"
        onSelect={this.props.onSelect}
        needle={this.state.needle}
        items={this.props.matchItems(toReg(this.state.needle))}/>
      <div className='SearchPopper_input'>
        <input
          ref="input"
          autoFocus={true}
          value={this.state.needle}
          placeholder="search"
          onBlur={this.props.onClose}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}/>
      </div>
    </div>
  }
})

module.exports = SearchPopper
