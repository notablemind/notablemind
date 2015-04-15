
global.navigator = {}
global.document = {createElement: () => ({
  setAttribute: () => {}
})}
global.window = {
  addEventListener: () => {}
}

import React from 'react/addons'
import {treedFromFile} from './utils'

import DocViewer from '../app/components/doc-viewer'

import fixture from './fixtures/tutorial-dump.nm.json'
import Treed from 'treed/classy'

var itreed = require('itreed')

import MemPL from 'treed/pl/mem'


const pl = new MemPL()

var plugins = [
  require('treed/plugins/undo'),
  require('treed/plugins/todo'),
  require('treed/plugins/image'),
  require('treed/plugins/types'),
  require('treed/plugins/collapse'),
  require('treed/plugins/clipboard'),
  require('treed/plugins/lists'),
  require('treed/plugins/rebase'),
  require('../treed-plugins/custom-css'),
  itreed({
    js: {
      server: {}
    }
  }),
]

import KeyboardHelper from '../app/components/keyboard-helper'
import SearchPopper from '../app/components/search-popper'
import List from 'treed/views/list'
import ListItem from 'treed/views/list/item'
import extend from 'itreed/lib/extend'
import CodeEditor from 'itreed/lib/components/code-editor'
import SimpleBody from 'treed/views/body/simple'

itreed.register(require('itreed/plugins/itreed-js'))
itreed.register(require('itreed/plugins/itreed-jupyter'))

console.log('start')
treedFromFile(Treed, fixture, plugins, pl, (err, {treed, file}) => {
  if (err) {
    throw err
  }
  console.log('treed from file')
  // treed.keyManager.listen(window)

  const props = treed.addView()

  var bodies = {
    default: {editor: null, renderer: null}
  }
  if (props.nodePlugins) {
    for (var i=0; i<props.nodePlugins.length; i++) {
      if (props.nodePlugins[i].bodies) {
        bodies = extend(bodies, props.nodePlugins[i].bodies)
      }
    }
  }

  const Comp = bodies['ipython'].editor
  const node = {
    "id": "64drvec30u7lz6vzxs4al9e052syh4a9",
    "content": "2+2",
    "children": [],
    "parent": "5ienkeresu7hjoxt5fnjz6400db4nlf6",
    "created": 1421133258741,
    "modified": 1428629336464,
    "type": "ipython",
    "language": "javascript",
    "waiting": false,
    "started": 1423864547761,
    "session": "k6hqfrheufmijw3wpzetuenm95abdqia",
    "executed": "2+2",
    "finished": 1423864548764,
    "display_collapsed": false,
    "outputs": [
      {
        "text/plain": "4",
        "type": "output",
        "suppressable": false
      }
    ]
  }

  const el = <SimpleBody
    node={node}
    editor={bodies.ipython.editor}
    renderer={bodies.ipython.renderer}
    actions={props.store.actions}
    store={props.store}
    isActive={false}
    editState={false}
  />

  console.log('amm')
  React.renderToString(el)
  console.log('good')

  /*
  let count = 0
  for (let id in treed.store.db.nodes) {
    count += 1
    const val = treed.store.db.nodes[id]
    try {
      React.renderToString(<ListItem
        store={props.store}
        plugins={props.nodePlugins}
        hideChildren={true}
        bodies={bodies}
        isRoot={false}
        id={id}/>)
    } catch (e) {
      console.log(id, count)
      console.log(JSON.stringify(val, null, 2))
      console.log(e.message)
      console.log(e.stack)
      throw e
    }
  }
  fail

  */

  const els = [
    <KeyboardHelper
      canGrabKeyboard={() => true}
      keys={treed.keyManager}
      plugins={treed.options.plugins}/>,
    <SearchPopper
      matchItems={() => []}
      onClose={() => {}}
      onSelect={() => {}}/>,
  ]

  els.forEach(el => {
    console.log('>>>>> RENDER')
    console.log(el.type.displayName)
    React.renderToString(el)
    console.log('<<<<< DONE')
  })


  const tel = <DocViewer
    saveWindowConfig={(a, b) => {b()}}
    keys={treed.keyManager}
    treed={treed}
    file={file}/>
  console.log('rendering')
  const str = React.renderToString(tel)
  console.log('rendered')
  process.exit(0)
})


