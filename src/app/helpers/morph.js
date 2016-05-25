
import {findDOMNode} from 'react-dom'

var Morph = {
  componentWillUpdate: function () {
    // console.log('will')
    var node = findDOMNode(this)
    this._width = node.style.width
    this._height = node.style.height
    var st = window.getComputedStyle(node)
    node.style.height = st.height
    node.style.width = st.width
  },
  componentDidUpdate: function () {
    var node = findDOMNode(this)
    var bef = window.getComputedStyle(node)
      , height = bef.height
      , width = bef.width
      , owidth = this._width
      , oheight = this._height
    node.style.height = oheight
    node.style.width = owidth
    var aft = window.getComputedStyle(node)
      , awidth = aft.width
      , aheight = aft.height
    if (awidth === width && aheight === height) {return}
    node.style.height = height
    node.style.width = width
    var ooverflow = node.style.overflow
      , otransition = node.style.transition
    node.style.overflow = 'hidden'
    node.style.transition = 'width .5s ease, height .5s ease'
    node.offsetHeight
    node.style.height = aheight
    node.style.width = awidth
    var done = () => {
      node.style.transition = otransition
      node.style.overflow = ooverflow
      node.style.height = oheight
      node.style.width = owidth
      node.removeEventListener('transitionend', done)
    }
    node.addEventListener('transitionend', done)
  }
}

module.exports = Morph

