
module.exports = function (oldBox, newBox, node, done) {
  var s = node.style
  s.position = 'fixed'
  s.top = oldBox.top + 'px'
  s.left = oldBox.left + 'px'
  s.width = oldBox.width + 'px'
  s.height = oldBox.height + 'px'
  // var style = window.getComputedStyle(node)
    // , oldWidth = style.maxWidth
  s.maxWidth = 'inherit'

  node.getBoundingClientRect()
  var awe = 'top left width height'
    , transition = awe.split(' ').map(function (attr) {
        s[attr] = oldBox[attr] + 'px'
        return attr + ' .2s ease'
      })
  node.style.transition = transition.join(', ')
  setTimeout(function () {
    awe.split(' ').forEach(function (attr) {
      s[attr] = newBox[attr] + 'px'
    })
  }, 0);

  node.addEventListener('transitionend', fin)
  function fin() {
    node.removeEventListener('transitionend', fin)
    node.style.removeProperty('position')
    node.style.removeProperty('max-width')
    node.style.removeProperty('transition')
    awe.split(' ').forEach(function (attr) {
      node.style.removeProperty(attr)
    })
    done()
  }
}

