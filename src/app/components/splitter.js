
var React = require('react/addons')
  , cx = require('classnames')
  , PT = React.PropTypes

var Splitter = React.createClass({
  propTypes: {
    onChangeRatio: PT.func,
    config: PT.object,
    pos: PT.array,
    comp: PT.func,
    cprops: PT.object,
  },

  getInitialState: function () {
    return {ratio: this.props.config.value.ratio || .5, moving: null}
  },
  getDefaultProps: function () {
    return {pos: []}
  },
  _onMouseDown: function (e) {
    e.preventDefault()
    this.setState({moving: true})
  },
  _mouseMove: function (e) {
    var full = this._node.getBoundingClientRect()
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

    this.setState({ratio: perc})
  },
  _mouseUp: function () {
    this.props.onChangeRatio(this.props.pos, this.state.ratio, () =>
      this.setState({moving: false}))
  },
  componentDidUpdate: function (prevProps, prevState) {
    var doc = this._node.ownerDocument
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
      children = <div className='Splitter_only' style={{flex: 1}}>
        <Comp {...this.props.cprops}
          key={config.value.config.store.view.id}
          pos={pos.concat(['first'])}
          value={config.value}/>
        </div>
    } else {
      var ratio = this.state.moving ? this.state.ratio : (config.value.ratio || .5)
      children = [
        <div className='Splitter_first' style={{flex: ratio}}>
          {!config.value.first.leaf ?
            <Splitter {...this.props}
              pos={pos.concat(['first'])}
              config={config.value.first} /> :
            <Comp {...this.props.cprops}
              key={config.value.first.value.config.store.view.id}
              pos={pos.concat(['first'])}
              value={config.value.first.value}/>}
        </div>,
        <div className='Splitter_div' onMouseDown={this._onMouseDown}/>,
        <div className='Splitter_second' style={{flex: 1 - ratio}}>
          {!config.value.second.leaf ?
            <Splitter {...this.props}
              pos={pos.concat(['second'])}
              config={config.value.second}/> :
            <Comp {...this.props.cprops}
              key={config.value.second.value.config.store.view.id}
              pos={pos.concat(['second'])}
              value={config.value.second.value}/>}
        </div>
      ]
    }
    return <div ref={n => this._node = n} className={cx({
      'Splitter': true,
      'Splitter-moving': this.state.moving,
    }) + ' Splitter-' + config.value.orient}>
      {children}
    </div>
  }
})

module.exports = Splitter
