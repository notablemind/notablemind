const React = require('react')
const {css, StyleSheet} = require('aphrodite')
const DefaultRenderer = require('treed/views/body/default-renderer')
const SimpleBody = require('treed/views/body/simple')
const Listener = require('treed/listener')

const Symlink = module.exports = React.createClass({
  mixins: [
    Listener({
      storeAttrs(getters, props) {
        return {
          real: getters.getNode(props.node.content),
        }
      },

      getListeners(props, events) {
        return [events.nodeChanged(props.node.content), events.nodeViewChanged(props.node.contents)]
      },

      shouldGetNew(nextProps) {
        return nextProps.node.content !== this.props.node.content
      },
    }),
  ],

  render() {
    const real = this.state.real
    const node = this.props.node
    if (!real) return <div>Broken symlink</div>
    if (real.type === 'symlink')
      return <div>Nested symlinks are *not* allowed</div>

    var body = this.props.bodies[real.type] || this.props.bodies.default
    return <div className={css(styles.symlink)}>
      <SimpleBody
        {...this.props}
        node={real}
        editor={body.editor}
        renderer={body.renderer}
      />
    </div>
  },
})


const styles = StyleSheet.create({
  symlink: {
    boxShadow: '2px 0 0 #4bbaff',
    // color: '#4bbaff',
    // fontStyle: 'italic',
    // padding: '5px 7px 3px',
  },
})
