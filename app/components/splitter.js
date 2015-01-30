
var React = require('react')
  , PT = React.PropTypes

var Splitter = React.createClass({
  getInitialState: function () {
    return {size: [1,1], moving: null}
  },
  _onMouseDown: function (e) {
    e.preventDefault()
    this.setState({moving: true})
  },
  _mouseMove: function (e) {
    var full = this.getDOMNode().getBoundingClientRect()
      , span
      , perc
    if (this.props.config.value.orient === 'horiz') {
      span = (full.right - full.left)
      perc = (e.clientX - full.left) / span
    } else {
      span = (full.bottom - full.top)
      perc = (e.clientY - full.top) / span
    }
    if (perc < 0 || perc > 1) return
    // if you get within ten pixels, snap.
    var dist = 10/span
    if (Math.abs(perc - .33) < dist) perc = .33
    if (Math.abs(perc - .67) < dist) perc = .67
    if (Math.abs(perc - .5) < dist) perc = .5

    this.setState({size: [perc, 1-perc]})
  },
  _mouseUp: function () {
    this.setState({moving: false})
  },
  componentDidUpdate: function (prevProps, prevState) {
    var doc = this.getDOMNode().ownerDocument
    if (prevState.moving && !this.state.moving) {
      doc.removeEventListener('mousemove', this._mouseMove)
      doc.removeEventListener('mouseup', this._mouseUp)
    } else if (this.state.moving && !prevState.moving) {
      doc.addEventListener('mousemove', this._mouseMove)
      doc.addEventListener('mouseup', this._mouseUp)
    }
  },

  render: function () {
    var config = this.props.config
      , pos = this.props.pos || []
      , Comp = this.props.comp
    var children
    if (config.leaf) {
      children = <div className='Splitter_first' style={{flex: 1}}>
        <Comp {...this.props.cprops}
          pos={pos.concat(['first'])}
          value={config.value}/>
        </div>
    } else {
      children = [
        <div className='Splitter_first' style={{flex: this.state.size[0]}}>
          {!config.value.first.leaf ?
            <Splitter {...this.props}
              pos={pos.concat(['first'])}
              config={config.value.first} /> :
            <Comp {...this.props.cprops}
              pos={pos.concat(['first'])}
              value={config.value.first.value}/>}
        </div>,
        <div className='Splitter_div' onMouseDown={this._onMouseDown}/>,
        <div className='Splitter_second' style={{flex: this.state.size[1]}}>
          {!config.value.second.leaf ?
            <Splitter {...this.props}
              pos={pos.concat(['second'])}
              config={config.value.second}/> :
            <Comp {...this.props.cprops}
              pos={pos.concat(['second'])}
              value={config.value.second.value}/>}
        </div>
      ]
    }
    return <div className={'Splitter Splitter-' + config.value.orient}>
      {children}
    </div>
  }
})

module.exports = Splitter
