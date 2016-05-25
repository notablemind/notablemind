/* @flow */

var React = require('react')
  , Modal = require('./modal')

module.exports = showModal

function showModal(title, initialState, body, done) {
  if (arguments.length === 3) {
    done = body
    body = initialState
    initialState = {}
  }
  var node = document.createElement('div')
  document.body.appendChild(node)
  var onClose = function (err) {
    node.parentNode.removeChild(node)
    done.apply(null, arguments)
  }
  React.render(React.createElement(Modal, {
    initialState: initialState,
    onClose: onClose, 
    title: title, 
    renderBody: body}), node)
}
