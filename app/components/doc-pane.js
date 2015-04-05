import React from 'react'
import TypeSwitcher from './type-switcher'

const {PropTypes: PT} = React

export default React.createClass({
  propTypes: {
    type: PT.string,
    viewTypes: PT.object,
    value: PT.object,
  },
  _onRebase: function () {
    var store = this.props.value.config.store
    this.props.onRebase(this.props.value.id, store.view.root)
  },
  componentDidMount: function () {
    var view = this.props.value.config.store
    view.on(view.events.rootChanged(), this._onRebase)
  },
  componentWillUnmount: function () {
    var view = this.props.value.config.store
    view.on(view.events.rootChanged(), this._onRebase)
  },
  render: function () {
    var props = this.props.value.config
    var statusbar = []
    props.plugins.map(plugin => {
      if (!plugin.statusbar) return
      statusbar.push(plugin.statusbar(props.store))
    })
    props.skipMix = ['top']
    var View = this.props.viewTypes[this.props.value.type]
    if (!View) {
      View = this.props.viewTypes.list
    }
    return <div className={'App_pane App_pane-' + this.props.value.type}>
      <div className='App_pane_top'>
        {statusbar}
        <div className='App_pane_splitters'>
          <button onClick={this.props.onSplit.bind(null, this.props.pos, 'horiz')}>||</button>
          <button onClick={this.props.onSplit.bind(null, this.props.pos, 'vert')}> = </button>
          <button onClick={this.props.onRemove.bind(null, this.props.pos)}>x</button>
        </div>
        <TypeSwitcher
          types={this.props.viewTypes}
          type={this.props.value.type}
          onChange={this.props.changeViewType.bind(null, this.props.value.id)}/>
      </div>
      <div className='App_pane_scroll'>
        <View {...props}/>
      </div>
    </div>
  }
})

