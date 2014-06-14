
var History = require('treed/skins/workflowy/history')
  , Wrapper = require('treed/skins/workflowy/wrap')
  , CtrlP = require('./ctrlp.jsx')
  , d = React.DOM

// manage lineage, create and initialize model instance. It owns the state for
// the model.
var MainApp = module.exports = React.createClass({
  displayName: 'MainPage',
  propTypes: {
    nm: React.PropTypes.object.isRequired,
    model: React.PropTypes.object.isRequired
  },
  getInitialState: function () {
    return {
      lineage: [],
    }
  },

  componentDidMount: function () {
    this.props.nm.on('bullet', this.updateBread)
    this.props.nm.refreshBullet()
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.nm !== this.props.nm) {
      nextProps.nm.on('bullet', this.updateBread)
      nextProps.nm.refreshBullet()
      this.props.nm.off('bullet', this.updateBread)
    }
  },
  componentWillUnmount: function () {
    this.props.nm.off('bullet', this.updateBread)
  },

  changeBread: function (id) {
    this.props.nm.actions.clickBullet(id)
  },
  updateBread: function (lineage) {
    this.setState({lineage: lineage})
  },

  render: function () {
    return d.div({
      className: 'workflowme'
    }, History({
         items: this.state.lineage,
         onClick: this.changeBread,
       }),
       CtrlP({
         model: this.props.model,
         onJump: this.changeBread
       }),
       Wrapper({
         ref: 'wf',
         node: this.props.view.getNode(),
         onBreadCrumb: this.updateBread
      })
    )
  }
})


