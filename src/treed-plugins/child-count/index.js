
const React = require('react')
const {css, StyleSheet} = require('aphrodite')

module.exports = {
  node: {
    blocks: {
      abovebody(node, actions) {
        if (!node.childCount || !node.collapsed) return
        return <div className={css(styles.childCount)}>
          {node.childCount}
        </div>
      }
    },
  },
}

const styles = StyleSheet.create({
  childCount: {
    padding: '2px 4px',
    fontSize: 8,
    position: 'absolute',
    right: '100%',
    top: 2,
    marginRight: 14,
  },
})

