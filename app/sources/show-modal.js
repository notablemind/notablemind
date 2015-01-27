/* @flow */

var React = require('treed/node_modules/react')
  , Modal = require('./modal')

module.exports = showModal

                                           

function showModal   (title        , body     , done    ) {
  var node = document.createElement('div')
  document.body.appendChild(node)
  var onClose = function (err        ) {
    node.parentNode.removeChild(node)
    done.apply(null, arguments)
  }
  React.render(React.createElement(Modal, {
    onClose: onClose, 
    title: title, 
    body: body}), node)
}
