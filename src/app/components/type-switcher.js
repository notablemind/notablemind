
import React from 'react'
import {StyleSheet, css} from 'aphrodite'

export default React.createClass({
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
    return <div className={css(styles.TypeSwitcher)}>
      <div
          onClick={this._toggleOpen}
          className={css(
            styles.icon,
            styles['icon_' + current]
          )}
      >
        {current}
      </div>
      {this.state.open &&
        <ul className={css(styles.dropdown)}>
          {keys.map(key => key !== current &&
            <li className={css(styles.item,
                               styles['item_' + key])}
                onClick={this._onSelect.bind(null, key)}
                key={key}>
              {key}
            </li>)}
        </ul>}
    </div>
  }
})

const styles = StyleSheet.create({
  TypeSwitcher: {
    position: 'relative',
  },

  icon: {
    padding: '5px 10px',
    cursor: 'pointer',
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    zIndex: 100,
    padding: 0,
    margin: 0,
    listStyle: 'none',
    backgroundColor: 'white',
    boxShadow: '0px 1px 1px #aaa',
  },

  item: {
    cursor: 'pointer',
    padding: '5px 10px',

    ':hover': {
      backgroundColor: '#eee',
    },
  },
})
