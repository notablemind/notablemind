/**
 * bootstrap the app into document.body
 */

import React from 'react'
import {render} from 'react-dom'
import RCSS from 'rcss'
import {run} from 'react-router'

import router from './app/router'
import config from './config'

window.React = React

window.onload = function () {
  RCSS.injectAll()
  const container = document.createElement('div')
  container.id = 'container'
  document.body.appendChild(container)

  run(router, function (Handler) {
    render(<Handler/>, container)
  });
}

