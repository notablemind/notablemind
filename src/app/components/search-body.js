
import React from 'react'
import ensureInView from 'treed/util/ensure-in-view'
import classnames from 'classnames'
import {highlight} from './search-utils'

const {PropTypes: PT} = React

export default React.createClass({
  propTypes: {
    items: PT.array,
    onSelect: PT.func,
  },

  getInitialState: function () {
    return {
      selected: 0,
    }
  },

  handleEnter: function (jump) {
    return this.props.onSelect(this.props.items[this.state.selected], jump)
  },

  handleGoUp: function () {
    if (this.state.selected < this.props.items.length - 1) {
      this.setState({selected: this.state.selected + 1})
    }
  },

  handleGoDown: function () {
    if (this.state.selected > 0) {
      this.setState({selected: this.state.selected - 1})
    }
  },

  componentWillReceiveProps: function () {
    this.setState({selected: 0})
  },

  componentDidMount: function () {
    if (!this.refs || !this.refs.selected) return;
    var node = this.refs.selected;
    node.offsetParent.scrollTop = node.offsetParent.scrollHeight
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (!this.refs || !this.refs.selected) return;
    var node = this.refs.selected
    if (prevState.selected !== this.state.selected) {
      ensureInView(node);
    } else {
      node.offsetParent.scrollTop = node.offsetParent.scrollHeight
    }
  },

  render: function () {
    var items = []
    for (var i=this.props.items.length-1; i>=0; i--) {
      var item = this.props.items[i]
      items.push(
        <li className={classnames({
          'SearchPopper_result': true,
          'SearchPopper_result-selected': i === this.state.selected,
        })}
          ref={i === this.state.selected ? 'selected' : undefined}
          onClick={this.props.onSelect.bind(null, item, false)}
          key={i}>
              {highlight(item.content, this.props.needle, 200)}
        </li>
      )
    }

    return <ul>
      {items}
    </ul>
  },
})

