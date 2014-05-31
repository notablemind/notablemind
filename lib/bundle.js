(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var DefaultNode = require('./lib/default-node')
  , DomViewLayer = require('./lib/dom-vl')
  , View = require('./lib/view')
  , Controller = require('./lib/controller')
  , Model = require('./lib/model')
  , util = require('./lib/util')

module.exports = {
  Model: WFModel,
  Controller: WFController
}

function WFNode(data, options, isNew) {
  DefaultNode.call(this, data, options, isNew)
}

WFNode.prototype = Object.create(DefaultNode.prototype)
WFNode.prototype.constructor = WFNode

WFNode.prototype.setAttr = function (attr, value) {
  if (attr !== 'done') {
    DefaultNode.prototype.setAttr.call(this, attr, value)
    return
  }
  this.done = value
  if (value) {
    this.node.classList.add('listless__default-node--done')
  } else {
    this.node.classList.remove('listless__default-node--done')
  }
}

WFNode.prototype.extra_actions = {
  'rebase': {
    binding: 'alt+return',
    action: function () {
      this.o.clickBullet()
    }
  },
  'back a level': {
    binding: 'shift+alt+return',
    action: function () {
      this.o.backALevel()
    }
  },
  'toggle done': {
    binding: 'ctrl+return',
    action: function () {
      this.blur()
      this.o.changed('done', !this.done)
      this.focus()
      if (this.done) {
        this.o.goDown()
      }
    }
  }
}

function WFView() {
  View.apply(this, arguments)
}

WFView.prototype = Object.create(View.prototype)

WFView.prototype.extra_actions = {
  'rebase': {
    binding: 'alt+return',
    action: function () {
      this.ctrl.actions.clickBullet(this.active)
    }
  },
  'back a level': {
    binding: 'shift+alt+return',
    action: function () {
      this.ctrl.actions.backALevel()
    }
  },
  'toggle done': {
    binding: 'ctrl+return',
    action: function () {
      if (this.active === null) return
      var id = this.active
        , done = !this.model.ids[id].data.done
        , next = this.model.idBelow(id, this.root)
      if (next === undefined) next = id
      this.ctrl.actions.changed(this.active, 'done', done)
      if (done) {
        this.goTo(next)
      }
    }
  }
}


function WFController(model, options) {
  options = util.merge({
    View: WFView,
    viewOptions: {
      ViewLayer: WFVL,
      node: WFNode
    },
    onBullet: function () {}
  }, options)
  Controller.call(this, model, options)
  this.o.onBullet(this.model.getLineage(model.root))
}

WFController.prototype = Object.create(Controller.prototype)

WFController.prototype.actions = util.extend({
  clickBullet: function (id) {
    if (id === 'new') return
    this.view.rebase(id)
    this.o.onBullet(this.model.getLineage(id))
  },
  backALevel: function () {
    var root = this.view.root
      , pid = this.model.ids[root].parent
    if (!this.model.ids[pid]) return
    this.actions.clickBullet(pid)
  }
}, Controller.prototype.actions)

function WFVL() {
  DomViewLayer.apply(this, arguments)
}

WFVL.prototype = Object.create(DomViewLayer.prototype)

WFVL.prototype.makeHead = function (body, actions) {
  var head = DomViewLayer.prototype.makeHead.call(this, body, actions)
    , bullet = document.createElement('div')
  bullet.classList.add('listless__bullet')
  bullet.addEventListener('mousedown', actions.clickBullet)
  head.insertBefore(bullet, head.childNodes[1])
  return head
}

function WFModel() {
  Model.apply(this, arguments)
}

WFModel.prototype = Object.create(Model.prototype)

WFModel.prototype.getLineage = function (id) {
  var lineage = []
  while (this.ids[id]) {
    lineage.unshift({
      name: this.ids[id].data.name,
      id: id
    })
    id = this.ids[id].parent
  }
  return lineage
}


},{"./lib/controller":5,"./lib/default-node":6,"./lib/dom-vl":8,"./lib/model":13,"./lib/util":14,"./lib/view":15}],2:[function(require,module,exports){

module.exports = BaseNode

var keys = require('./keys')
  , util = require('./util')

function BaseNode(data, options, isNew) {
  this.name = data.name
  this.isNew = isNew
  this.o = options
  this.o.keybindings = util.merge(this.default_keys, options.keys)

  this.editing = false
  this.setupNode();
}

BaseNode.addAction = function (name, binding, func) {
  if (!this.extra_actions) {
    this.extra_actions = {}
  }
  this.extra_actions[name] = {
    binding: binding,
    func: func
  }
}

BaseNode.prototype = {
  // public
  startEditing: function (fromStart) {
  },
  stopEditing: function () {
  },
  addEditText: function (text) {
  },
  setData: function (data) {
  },
  setAttr: function (attr, value) {
  },

  // protexted
  isAtStart: function () {
  },
  isAtEnd: function () {
  },
  isAtBottom: function () {
  },
  isAtTop: function () {
  },

  setupNode: function () {
  },
  setInputValue: function (value) {
  },
  getInputValue: function () {
  },
  setTextContent: function (value) {
  },
  getSelectionPosition: function () {
  },


  // Should there be a canStopEditing?
  focus: function () {
    this.startEditing();
  },
  blur: function () {
    this.stopEditing();
  },
  
  keyHandler: function () {
    var actions = {}
      , name
    for (name in this.o.keybindings) {
      actions[this.o.keybindings[name]] = this.actions[name]
    }

    if (this.extra_actions) {
      for (name in this.extra_actions) {
        if (!actions[name]) {
          actions[this.extra_actions[name].binding] = this.extra_actions[name].action
        }
      }
    }

    return keys(actions).bind(this)
  },


  default_keys: {
    'undo': 'ctrl+z',
    'redo': 'ctrl+shift+z',
    'collapse': 'alt+left',
    'uncollapse': 'alt+right',
    'dedent': 'shift+tab, shift+alt+left',
    'indent': 'tab, shift+alt+right',
    'move up': 'shift+alt+up',
    'move down': 'shift+alt+down',
    'up': 'up',
    'down': 'down',
    'left': 'left',
    'right': 'right',
    'add after': 'return',
    'insert return': 'shift+return',
    'merge up': 'backspace',
    'stop editing': 'escape',
  },

  actions: {
    'undo': function () {
      this.o.undo()
    },
    'redo': function () {
      this.o.redo()
    },
    'collapse': function () {
      this.o.toggleCollapse(true)
    },
    'uncollapse': function () {
      this.o.toggleCollapse(false)
    },
    'dedent': function () {
      this.o.moveLeft()
    },
    'indent': function () {
      this.o.moveRight()
    },
    'move up': function () {
      this.o.moveUp()
    },
    'move down': function () {
      this.o.moveDown()
    },
    'up': function () {
      if (this.isAtTop()) {
        this.o.goUp();
      } else {
        return true
      }
    },
    'down': function () {
      if (this.isAtBottom()) {
        this.o.goDown()
      } else {
        return true
      }
    },
    'left': function () {
      if (this.isAtStart()) {
        return this.o.goUp()
      }
      return true
    },
    'right': function () {
      if (this.isAtEnd()) {
        return this.o.goDown(true)
      }
      return true
    },
    'insert return': function (e) {
      return true
    },
    'add after': function () {
      var ss = this.getSelectionPosition()
        , name = this.getInputValue()
        , rest = null
      if (name.indexOf('\n') !== -1) {
        return true
      }
      if (ss < name.length) {
        rest = name.slice(ss)
        this.name = name.slice(0, ss)
        this.setInputValue(this.name)
        this.setTextContent(this.name)
      } else {
        this.name = name
        this.setInputValue(this.name)
        this.setTextContent(this.name)
      }
      if (!this.isNew) this.o.changed('name', this.name)
      this.o.addAfter(rest)
    },
    // on backspace
    'merge up': function () {
      var value = this.getInputValue()
      if (!value) {
        return this.o.remove()
      }
      if (this.isAtStart()) {
        return this.o.remove(value)
      }
      return true
    },
    'stop editing': function () {
      this.stopEditing();
    }
  },
}


},{"./keys":10,"./util":14}],3:[function(require,module,exports){

var commands = require('./commands')

module.exports = Commandeger

function makeCommand(type, args) {
  var names = commands[type].args
    , data = {}
  for (var i=0; i<names.length; i++) {
    data[names[i]] = args[i]
  }
  return {type: type, data: data}
}

function Commandeger(view, model) {
  this.commands = []
  this.histpos = 0
  this.view = view
  this.listeners = {}
  this.working = false
  this.model = model
}

Commandeger.prototype = {
  /**
   * You can pass in any number of type, args pairs.
   * Ex: executeCommands(t1, a1, t2, a2, ...)
   */
  executeCommands: function (type, args) {
    if (this.working) return
    var cmds = [];
    for (var i=0; i<arguments.length; i+=2) {
      cmds.push(makeCommand(arguments[i], arguments[i+1]))
    }
    if (this.histpos > 0) {
      this.commands = this.commands.slice(0, -this.histpos)
      this.histpos = 0
    }
    this.commands.push(cmds)
    for (var i=0; i<cmds.length; i++) {
      this.doCommand(cmds[i])
    }
    this.trigger('change')
  },
  trigger: function (what) {
    for (var item in this.listeners[what]) {
      this.listeners[what][item].apply(null, [].slice.call(arguments, 1))
    }
  },
  on: function (what, cb) {
    if (!this.listeners[what]) {
      this.listeners[what] = []
    }
    this.listeners[what].push(cb)
  },
  undo: function () {
    document.activeElement.blur()
    var pos = this.histpos ? this.histpos + 1 : 1
      , ix = this.commands.length - pos
    if (ix < 0) {
      return false // no more undo!
    }
    var cmds = this.commands[ix]
    for (var i=cmds.length-1; i>=0; i--) {
      this.undoCommand(cmds[i])
    }
    this.histpos += 1
    this.trigger('change')
    return true
  },
  redo: function () {
    var pos = this.histpos ? this.histpos - 1 : -1
      , ix = this.commands.length - 1 - pos
    if (ix >= this.commands.length) {
      return false // no more to redo!
    }
    var cmds = this.commands[ix]
    for (var i=0; i<cmds.length; i++) {
      this.redoCommand(cmds[i])
    }
    this.histpos -= 1
    this.trigger('change')
    return true
  },
  doCommand: function (cmd) {
    this.working = true
    commands[cmd.type].apply.call(cmd.data, this.view, this.model)
    this.working = false
  },
  undoCommand: function (cmd) {
    this.working = true
    commands[cmd.type].undo.call(cmd.data, this.view, this.model)
    this.working = false
  },
  redoCommand: function (cmd) {
    this.working = true
    var c = commands[cmd.type]
    ;(c.redo || c.apply).call(cmd.data, this.view, this.model)
    this.working = false
  },
}


},{"./commands":4}],4:[function(require,module,exports){

function copy(one) {
  if ('object' !== typeof one) return one
  var two = {}
  for (var name in one) {
    two[name] = one[name]
  }
  return two
}

module.exports = {
  collapse: {
    args: ['id', 'doCollapse'],
    apply: function (view, model) {
      model.setCollapsed(this.id, this.doCollapse)
      view.setCollapsed(this.id, this.doCollapse)
      view.goTo(this.id)
    },
    undo: function (view, model) {
      model.setCollapsed(this.id, !this.doCollapse)
      view.setCollapsed(this.id, !this.doCollapse)
      view.goTo(this.id)
    },
  },
  newNode: {
    args: ['pid', 'index', 'text'],
    apply: function (view, model) {
      var cr = model.create(this.pid, this.index, this.text)
      this.id = cr.node.id
      view.add(cr.node, cr.before)
      // view.startEditing(cr.node.id)
    },
    undo: function (view, model) {
      var ed = view.editing
      view.remove(this.id)
      this.saved = model.remove(this.id)
      var nid = model.ids[this.pid].children[this.index-1]
      if (nid === undefined) nid = this.pid
      if (ed) {
        view.startEditing(nid)
      } else {
        view.setActive(nid)
      }
    },
    redo: function (view, model) {
      var before = model.readd(this.saved)
      view.add(this.saved.node, before)
    }
  },
  appendText: {
    args: ['id', 'text'],
    apply: function (view, model) {
      this.oldtext = model.ids[this.id].data.name
      model.appendText(this.id, this.text)
      view.appendText(this.id, this.text)
    },
    undo: function (view, model) {
      model.setAttr(this.id, 'name', this.oldtext)
      view.setAttr(this.id, 'name', this.oldtext)
    }
  },
  changeNodeAttr: {
    args: ['id', 'attr', 'value'],
    apply: function (view, model) {
      this.oldvalue = copy(model.ids[this.id].data[this.attr])
      model.setAttr(this.id, this.attr, this.value)
      view.setAttr(this.id, this.attr, this.value)
      view.goTo(this.id)
    },
    undo: function (view, model) {
      model.setAttr(this.id, this.attr, this.oldvalue)
      view.setAttr(this.id, this.attr, this.oldvalue)
      view.goTo(this.id)
    }
  },
  changeNode: {
    args: ['id', 'newdata'],
    apply: function (view, model) {
      this.olddata = copy(model.ids[this.id].data)
      model.setData(this.id, this.newdata)
      view.setData(this.id, this.newdata)
      view.goTo(this.id)
    },
    undo: function (view, model) {
      model.setData(this.id, this.olddata)
      view.setData(this.id, this.olddata)
      view.goTo(this.id)
    }
  },
  remove: {
    args: ['id'],
    apply: function (view, model) {
      var below = model.nextSibling(this.id)
      if (undefined === below) below = model.idAbove(this.id)
      view.remove(this.id)
      this.saved = model.remove(this.id)
      view.startEditing(below)
    },
    undo: function (view, model) {
      var before = model.readd(this.saved)
      view.addTree(this.saved.node, before)
    }
  },
  copy: {
    args: ['ids'],
    apply: function (view, model) {
      var items = this.ids.map(function (id) {
        return model.dumpData(id, true)
      })
      model.clipboard = items
    },
    undo: function (view, model) {
    }
  },
  cut: {
    args: ['ids'],
    apply: function (view, model) {
      var items = this.ids.map(function (id) {
        view.remove(id)
        return model.dumpData(id, true)
      })
      model.clipboard = items

      var id = this.ids[this.ids.length-1]
      var below = model.nextSibling(id)
      if (undefined === below) below = model.idAbove(this.ids[0])
      this.saved = this.ids.map(function (id) {
        return model.remove(id)
      })

      if (view.editing) {
        view.startEditing(below)
      } else {
        view.setActive(below)
      }
    },
    undo: function (view, model) {
      var before
      for (var i=this.saved.length-1; i>=0; i--) {
        before = model.readd(this.saved[i])
        view.addTree(this.saved[i].node, before)
      }
      if (this.ids.length > 1) {
        view.setSelection(this.ids)
        view.setActive(this.ids[this.ids.length-1])
      }
    }
  },
  paste: {
    args: ['pid', 'index'],
    apply: function (view, model) {
      var pid = this.pid
        , index = this.index
        , ed = view.editing
      var ids = model.clipboard.map(function (item) {
        var cr = model.createNodes(pid, index, item)
        view.addTree(cr.node, cr.before)
        view.setCollapsed(cr.node.parent, false)
        model.setCollapsed(cr.node.parent, false)
        index += 1
        return cr.node.id
      })
      this.newids = ids
      if (ids.length == 1) {
        if (ed) {
          view.startEditing(this.newids[0])
        } else {
          view.setActive(this.newids[0])
        }
      } else {
        view.setSelection(ids)
        view.setActive(ids[ids.length-1])
      }
    },
    undo: function (view, model) {
      var id = this.newids[this.newids.length-1]
      var below = model.nextSibling(id)
      if (undefined === below) below = model.idAbove(this.newids[0])
      this.saved = this.newids.map(function (id) {
        view.remove(id)
        return model.remove(id)
      })
      if (view.editing) {
        view.startEditing(below)
      } else {
        view.setActive(below)
      }
      // view.remove(this.newid)
      // this.saved = model.remove(this.newid)
      model.clipboard = this.saved
    },
    redo: function (view, model) {
      // var before = model.readd(this.saved)
      // view.addTree(this.saved.node, before)
      this.saved.map(function (item) {
        var before = model.readd(item)
        view.addTree(item.node, before)
      })
    }
  },
  move: {
    args: ['id', 'pid', 'index'],
    apply: function (view, model) {
      this.opid = model.ids[this.id].parent
      this.oindex = model.ids[this.opid].children.indexOf(this.id)
      var before = model.move(this.id, this.pid, this.index)
      var parent = model.ids[this.opid]
        , lastchild = parent.children.length === 0
      view.move(this.id, this.pid, before, this.opid, lastchild)
      view.goTo(this.id)
    },
    undo: function (view, model) {
      var before = model.move(this.id, this.opid, this.oindex)
        , lastchild = model.ids[this.pid].children.length === 0
      view.move(this.id, this.opid, before, this.pid, lastchild)
      view.goTo(this.id)
    }
  }
}


},{}],5:[function(require,module,exports){

module.exports = Controller

var View = require('./view')
  , Commandeger = require('./commandeger')
  , DefaultNode = require('./default-node')
  , View = require('./view')

  , util = require('./util')

function Controller(model, o) {
  o = o || {viewOptions: {}}
  this.o = util.extend({
    View: View,
  }, o)
  this.o.viewOptions = util.extend({
    node: DefaultNode
  }, o.viewOptions)
  this.model = model
  this.view = new this.o.View(
    this.bindActions.bind(this),
    this.model, this,
    this.o.viewOptions
  )
  this.node = this.view.initialize(model.root)
  this.cmd = new Commandeger(this.view, this.model)

  var actions = {}
  for (var name in this.actions) {
    if ('string' === typeof this.actions[name]) actions[name] = this.actions[name]
    else actions[name] = this.actions[name].bind(this)
  }
  this.actions = actions
  this.listeners = {}
  // connect the two.
}

Controller.prototype = {
  undo: function () {this.cmd.undo()},
  redo: function () {this.cmd.redo()},
  on: function (evt, func) {
    if (!this.listeners[evt]) {
      this.listeners[evt] = []
    }
    this.listeners[evt].push(func)
  },
  trigger: function (evt) {
    if (!this.listeners[evt]) return
    var args = [].slice.call(arguments, 1)
    for (var i=0; i<this.listeners[evt].length; i++) {
      this.listeners[evt][i].apply(null, args)
    }
  },

  bindActions: function (id) {
    var actions = {}
      , val
    for (var action in this.actions) {
      val = this.actions[action]
      if ('string' === typeof val) {
        val = this[val][action].bind(this[val], id)
      } else {
        val = val.bind(this, id)
      }
      actions[action] = val
    }
    return actions
  },

  executeCommands: function () {
    this.cmd.executeCommands.apply(this.cmd, arguments)
  },

  // public
  setCollapsed: function (id, doCollapse) {
    if (!this.model.hasChildren(id)) return
    if (this.model.isCollapsed(id) === doCollapse) return
    this.executeCommands('collapse', [id, doCollapse]);
  },
  addBefore: function (id, text) {
    var nw = this.model.idNew(id, true)
    this.executeCommands('newNode', [nw.pid, nw.index, text])
  },

  actions: {
    trigger: function () {
      this.trigger.apply(this, arguments)
    },
    goUp: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return this.view.goTo(this.view.root)
      // should I check to see if it's ok?
      var above = this.model.idAbove(id)
      if (above === undefined) return
      this.view.startEditing(above);
    },
    goDown: function (id, fromStart) {
      if (id === 'new') return this.view.goTo(this.view.root)
      var below = this.model.idBelow(id, this.view.root)
      if (below === undefined) return
      this.view.startEditing(below, fromStart);
    },
    goLeft: function (id) {
      if (id === 'new') return this.view.goTo(this.view.root)
      if (id === this.view.root) return
      var parent = this.model.getParent(id)
      if (!parent) return
      this.view.startEditing(parent)
    },
    goRight: function (id) {
      if (id === 'new') return this.view.goTo(this.view.root)
      var child = this.model.getChild(id)
      if (!child) return
      this.view.startEditing(child)
    },
    startMoving: function (id) {
      if (id === 'new') return
      if (id === this.view.root) return
      this.view.startMoving(id)
    },

    // modification
    undo: function () {this.cmd.undo()},
    redo: function () {this.cmd.redo()},

    // commanders
    cut: function (ids) {
      if (ids === this.view.root) return
      if (!Array.isArray(ids)) {
        ids = [ids]
      }
      this.executeCommands('cut', [ids])
    },
    copy: function (ids) {
      if (!Array.isArray(ids)) {
        ids = [ids]
      }
      this.executeCommands('copy', [ids])
    },

    paste: function (id, above) {
      if (!this.model.clipboard) return
      var nw = this.model.idNew(id, above)
      this.executeCommands('paste', [nw.pid, nw.index])
    },
    changed: function (id, attr, value) {
      if (id === 'new') {
        if (!value) return
        var nw = this.view.removeNew()
        this.executeCommands('newNode', [nw.pid, nw.index, value])
        return
      }
      this.executeCommands('changeNodeAttr', [id, attr, value])
    },
    move: function (where, id, target) {
      var action = {
        before: 'ToBefore',
        after: 'ToAfter',
        child: 'Into'
      }[where]
      this.actions['move' + action](id, target)//target, id)
    },
    moveToBefore: function (id, sid) {
      if (id === this.view.root) return
      if (id === 'new') return
      var place = this.model.moveBeforePlace(sid, id)
      if (!place) return
      // if (this.model.samePlace(id, place)) return
      this.executeCommands('move', [id, place.pid, place.ix])
    },
    moveToAfter: function (id, sid) {
      if (id === this.view.root) return
      if (id === 'new') return
      var place = this.model.moveAfterPlace(sid, id)
      if (!place) return
      // if (this.model.samePlace(id, place)) return
      this.executeCommands('move', [id, place.pid, place.ix])
    },
    moveInto: function (id, pid) {
      if (id === this.view.root) return
      if (id === 'new') return
      if (this.model.samePlace(id, {pid: pid, ix: 0})) return
      if (!this.model.isCollapsed(pid)) {
        return this.executeCommands('move', [id, pid, 0])
      }
      this.executeCommands('collapse', [pid, false], 'move', [id, pid, 0])
    },
    moveRight: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return
      var sib = this.model.prevSibling(id, true)
      if (undefined === sib) return
      if (!this.model.isCollapsed(sib)) {
        return this.executeCommands('move', [id, sib, false])
      }
      this.executeCommands('collapse', [sib, false], 'move', [id, sib, false])
    },
    moveLeft: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return
      if (this.model.ids[id].parent === this.view.root) return
      // TODO handle multiple selected
      var place = this.model.shiftLeftPlace(id)
      if (!place) return
      this.executeCommands('move', [id, place.pid, place.ix])
    },
    moveUp: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return
      // TODO handle multiple selected
      var place = this.model.shiftUpPlace(id)
      if (!place) return
      this.executeCommands('move', [id, place.pid, place.ix])
    },
    moveDown: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return
      // TODO handle multiple selected
      var place = this.model.shiftDownPlace(id)
      if (!place) return
      this.executeCommands('move', [id, place.pid, place.ix])
    },
    moveToTop: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return
      var first = this.model.firstSibling(id)
      if (undefined === first) return
      var pid = this.model.ids[first].parent
      if (pid === undefined) return
      var ix = this.model.ids[pid].children.indexOf(first)
      this.executeCommands('move', [id, pid, ix])
    },
    moveToBottom: function (id) {
      if (id === this.view.root) return
      if (id === 'new') return
      var last = this.model.lastSibling(id)
      if (undefined === last) return
      var pid = this.model.ids[last].parent
      if (pid === undefined) return
      var ix = this.model.ids[pid].children.indexOf(last)
      this.executeCommands('move', [id, pid, ix + 1])
    },
    toggleCollapse: function (id, yes) {
      if (id === this.view.root) return
      if (id === 'new') return
      if (arguments.length === 1) {
        yes = !this.model.ids[id].children.length || !this.model.isCollapsed(id)
      }
      if (yes) {
        id = this.model.findCollapser(id)
        if (!this.model.hasChildren(id) || this.model.isCollapsed(id)) return
      } else {
        if (!this.model.hasChildren(id) || !this.model.isCollapsed(id)) return
      }
      this.executeCommands('collapse', [id, yes])
    },
    addBefore: function (id, text) {
      if (id === this.view.root) return
      if (id === 'new') {
        // TODO: better behavior here
        return
      }
      var nw = this.model.idNew(id, true)
      this.executeCommands('newNode', [nw.pid, nw.index, text])
    },
    addAfter: function (id, text) {
      if (id === 'new') {
        // TODO: better behavior here

        var nw = this.view.removeNew()
        this.executeCommands(
          'newNode', [nw.pid, nw.index+1, '']
        )
        return
      }
      if (id === this.view.root) {
        if (this.view.newNode) return this.view.startEditing('new')
        this.view.addNew(id, 0)
        this.view.startEditing('new')
        return
      }
      var nw = this.model.idNew(id, false, this.view.root)
        , ed = this.view.editing
      this.executeCommands('newNode', [nw.pid, nw.index, text])
      if (ed) this.view.startEditing()
    },
    remove: function (id, addText) {
      if (id === this.view.root) return
      if (id === 'new') return
      var before = this.model.idAbove(id)
      this.executeCommands(
        'remove', [id],
        'appendText', [before, addText || '']
      )
    },
    setEditing: 'view',
    doneEditing: 'view'
  }
}


},{"./commandeger":3,"./default-node":6,"./util":14,"./view":15}],6:[function(require,module,exports){

module.exports = DefaultNode

var BaseNode = require('./base-node')

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
})

function DefaultNode(data, options, isNew) {
  BaseNode.call(this, data, options, isNew)
}

DefaultNode.prototype = Object.create(BaseNode.prototype)
DefaultNode.prototype.constructor = DefaultNode
// merge(DefaultNode, BaseNode)

function tmerge(a, b) {
  for (var c in b) {
    a[c] = b[c]
  }
}

tmerge(DefaultNode.prototype, {
  setInputValue: function (value) {
    var html = value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    this.input.innerHTML = html;
  },
  getInputValue: function () {
    return this.input.innerHTML
            .replace(/<div>/g, '\n').replace(/<br>/g, '\n')
            .replace(/<\/div>/g, '').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>').replace(/\u200b/g, '')
  },
  setTextContent: function (value) {
    this.text.innerHTML = marked(value)
  },
  setupNode: function () {
    this.node = document.createElement('div')
    this.input = document.createElement('div')
    this.input.setAttribute('contenteditable', true)
    this.input.classList.add('listless__input')
    this.text = document.createElement('div')
    this.text.classList.add('listless__text')
    this.node.classList.add('listless__default-node')

    this.setTextContent(this.name)
    this.node.appendChild(this.text)
    this.registerListeners();
  },
  isAtTop: function () {
    var bb = this.input.getBoundingClientRect()
      , selr = window.getSelection().getRangeAt(0).getClientRects()[0]
    return selr.top < bb.top + 5
  },
  isAtBottom: function () {
    var bb = this.input.getBoundingClientRect()
      , selr = window.getSelection().getRangeAt(0).getClientRects()[0]
    return selr.bottom > bb.bottom - 5
  },
  getSelectionPosition: function () {
    var sel = window.getSelection()
      , ran = sel.getRangeAt(0)
    return ran.startOffset
  },
  startEditing: function (fromStart) {
    if (this.editing) return
    this.editing = true;
    this.setInputValue(this.name)
    this.node.replaceChild(this.input, this.text)
    this.input.focus();
    this.setSelection(!fromStart)
    this.o.setEditing()
  },
  stopEditing: function () {
    if (!this.editing) return
    console.log('stop eddint', this.isNew)
    var value = this.getInputValue()
    this.editing = false
    this.node.replaceChild(this.text, this.input)
    this.o.doneEditing();
    if (this.name != value || this.isNew) {
      this.setTextContent(value)
      this.name = value
      this.o.changed('name', this.name)
    }
  },

  isAtStart: function () {
    return this.getSelectionPosition() === 0
  },

  isAtEnd: function () {
    console.warn("THIS IS WRONG")
    return false
  },
  addEditText: function (text) {
    var pl = this.name.length
    this.name += text
    this.setInputValue(this.name)
    this.setTextContent(this.name)
    if (!this.editing) {
      this.editing = true;
      this.node.replaceChild(this.input, this.text)
      this.o.setEditing();
    }
    this.setSelection(pl)
  },
  setAttr: function (attr, value) {
    if (attr === 'name') {
      this.name = value
      this.setInputValue(value)
      this.setTextContent(value)
    }
  },

  registerListeners: function () {
    this.text.addEventListener('mousedown', function (e) {
      this.startEditing();
      e.preventDefault()
      return false
    }.bind(this))

    this.input.addEventListener('blur', function (e) {
      this.stopEditing();
      e.preventDefault()
      return false
    }.bind(this));
    
    var keyHandler = this.keyHandler()

    this.input.addEventListener('keydown', function (e) {
      e.stopPropagation()
      return keyHandler(e)
    })

  },
  setSelection: function (end) {
    var sel = window.getSelection()
    sel.selectAllChildren(this.input)
    try {
      sel['collapseTo' + (end ? 'End' : 'Start')]()
    } catch (e) {}
  },

})


},{"./base-node":2}],7:[function(require,module,exports){

module.exports = DungeonsAndDragons

function findTarget(targets, e) {
  for (var i=0; i<targets.length; i++) {
    if (targets[i].top > e.clientY) {
      return targets[i > 0 ? i-1 : 0]
    }
  }
  return targets[targets.length-1]
}

// Manages Dragging N Dropping
function DungeonsAndDragons(vl, action) {
  this.vl = vl
  this.action = action
}

DungeonsAndDragons.prototype = {
  startMoving: function (targets, id) {
    this.moving = {
      targets: targets,
      shadow: this.vl.makeDropShadow(),
      current: null
    }
    this.vl.setMoving(id, true)
    var onMove = function (e) {
      this.drag(id, e)
    }.bind(this)
    var onUp = function (e) {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      this.drop(id, e)
    }.bind(this)

    document.body.style.cursor = 'move'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  },
  drag: function (id, e) {
    if (this.moving.current) {
      this.vl.setDropping(this.moving.current.id, false, this.moving.current.place === 'child')
    }
    var target = findTarget(this.moving.targets, e)
    this.moving.shadow.moveTo(target)
    this.moving.current = target
    this.vl.setDropping(target.id, true, this.moving.current.place === 'child')
  },
  drop: function (id, e) {
    this.moving.shadow.remove()
    var current = this.moving.current
    this.vl.setMoving(id, false)
    if (!this.moving.current) return
    this.vl.setDropping(current.id, false, current.place === 'child')
    if (current.id === id) return
    this.action(current.place, id, current.id)
    this.moving = false
  },
}


},{}],8:[function(require,module,exports){

module.exports = DomViewLayer

function ensureInView(item) {
  var bb = item.getBoundingClientRect()
  if (bb.top < 0) return item.scrollIntoView()
  if (bb.bottom > window.innerHeight) {
    item.scrollIntoView(false)
  }
}

function DropShadow(height, clsName) {
  this.node = document.createElement('div')
  this.node.classList.add(clsName || 'listless__drop-shadow')
  this.height = height || 10
  document.body.appendChild(this.node)
}

DropShadow.prototype = {
  moveTo: function (target) {
    this.node.style.top = target.show.y - this.height/2 + 'px'
    this.node.style.left = target.show.left + 'px'
    this.node.style.height = this.height + 'px'
    // this.node.style.height = target.height + 10 + 'px'
    this.node.style.width = target.show.width + 'px'
  },
  remove: function () {
    this.node.parentNode.removeChild(this.node)
  }
}

function DomViewLayer(o) {
  this.dom = {}
  this.root = null
  this.o = o
}

DomViewLayer.prototype = {
  clear: function () {
    this.dom = {}
  },
  rebase: function (root) {
    root.parentNode.replaceChild(this.root, root)
  },
  dropTargets: function (root, model, moving, top) {
    var targets = []
      , bc = this.dom[root].head.getBoundingClientRect()
      , target
      , childTarget

    if (!top) {
      target = {
        id: root,
        top: bc.top,
        left: bc.left,
        width: bc.width,
        height: bc.height,
        place: 'after', // 'before',
        show: {
          left: bc.left,// + 20,
          width: bc.width,// - 20,
          y: bc.bottom
        }
      }
      if (model.ids[root].children.length && !model.isCollapsed(root)) {
        // show insert below children
        target.show.y = this.dom[root].ul.getBoundingClientRect().bottom
      }
      targets.push(target)
    }
    if (root === moving) return targets
    childTarget = {
      id: root,
      top: bc.bottom - 7,
      left: bc.left + 20,
      width: bc.width,
      place: 'child',
      show: {
        left: bc.left + 40,
        width: bc.width - 40,
        y: bc.top + bc.height
      },
      height: 7
    }
    targets.push(childTarget)

    if (model.isCollapsed(root) && !top) return targets
    var ch = model.ids[root].children
    for (var i=0; i<ch.length; i++) {
      targets = targets.concat(this.dropTargets(ch[i], model, moving))
    }
    return targets
  },
  makeDropShadow: function () {
    return new DropShadow()
  },

  remove: function (id, pid, lastchild) {
    var n = this.dom[id]
    if (!n.main.parentNode) return
    try {
      n.main.parentNode.removeChild(n.main)
    } catch (e) {return}
    delete this.dom[id]
    if (lastchild) {
      this.dom[pid].main.classList.add('listless__item--parent')
    }
  },
  addNew: function (node, bounds, before, children) {
    var dom = this.makeNode(node.id, node.data, node.depth - this.rootDepth, bounds)
    this.add(node.parent, before, dom, children)
    if (node.collapsed && node.children.length) {
      this.setCollapsed(node.id, true)
    }
  },
  add: function (parent, before, dom, children) {
    var p = this.dom[parent]
    if (before === false) {
      p.ul.appendChild(dom)
    } else {
      var bef = this.dom[before]
      p.ul.insertBefore(dom, bef.main)
    }
    if (children) {
      dom.classList.add('listless__item--parent')
    }
  },
  body: function (id) {
    if (!this.dom[id]) return
    return this.dom[id].body
  },
  move: function (id, pid, before, ppid, lastchild) {
    var d = this.dom[id]
    d.main.parentNode.removeChild(d.main)
    if (lastchild) {
      this.dom[ppid].main.classList.remove('listless__item--parent')
    }
    if (before === false) {
      this.dom[pid].ul.appendChild(d.main)
    } else {
      this.dom[pid].ul.insertBefore(d.main, this.dom[before].main)
    }
    this.dom[pid].main.classList.add('listless__item--parent')
  },
  clearSelection: function (selection) {
    for (var i=0; i<selection.length; i++) {
      if (!this.dom[selection[i]]) continue;
      this.dom[selection[i]].main.classList.remove('selected')
    }
  },
  showSelection: function (selection) {
    if (!selection.length) return
    // ensureInView(this.dom[selection[0]].body.node)
    for (var i=0; i<selection.length; i++) {
      this.dom[selection[i]].main.classList.add('selected')
    }
  },

  clearActive: function (id) {
    this.dom[id].main.classList.remove('active')
  },
  showActive: function (id) {
    ensureInView(this.dom[id].body.node)
    this.dom[id].main.classList.add('active')
  },

  setCollapsed: function (id, isCollapsed) {
    this.dom[id].main.classList[isCollapsed ? 'add' : 'remove']('collapsed')
  },

  setMoving: function (id, isMoving) {
    this.root.classList[isMoving ? 'add' : 'remove']('moving')
    this.dom[id].main.classList[isMoving ? 'add' : 'remove']('moving')
  },

  setDropping: function (id, isDropping, isChild) {
    var cls = 'dropping' + (isChild ? '-child' : '')
    this.dom[id].main.classList[isDropping ? 'add' : 'remove'](cls)
  },

  makeRoot: function (node, bounds) {
    var dom = this.makeNode(node.id, node.data, 0, bounds)
      , root = document.createElement('div')
    root.classList.add('listless')
    root.appendChild(dom)
    if (node.collapsed && node.children.length) {
      this.setCollapsed(node.id, true)
    }
    this.root = root
    this.rootDepth = node.depth
    return root
  },

  makeHead: function (body, actions) {
    var head = document.createElement('div')
      , collapser = document.createElement('div')
      , mover = document.createElement('div')

    collapser.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return
      actions.toggleCollapse()
    })
    collapser.classList.add('listless__collapser')

    mover.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      actions.startMoving()
      return false
    })
    mover.classList.add('listless__mover')

    head.classList.add('listless__head')
    head.appendChild(collapser)
    head.appendChild(body.node);
    head.appendChild(mover)
    return head
  },

  makeNode: function (id, data, level, bounds) {
    var dom = document.createElement('li')
      , body = this.bodyFor(id, data, bounds)

    dom.classList.add('listless__item')
    // dom.classList.add('listless__item--level-' + level)

    var head = this.makeHead(body, bounds)
    dom.appendChild(head)

    var ul = document.createElement('ul')
    ul.classList.add('listless__children')
    dom.appendChild(ul)
    this.dom[id] = {main: dom, body: body, ul: ul, head: head}
    return dom
  },

  /** returns a dom node **/
  bodyFor: function (id, data, bounds) {
    var dom = new this.o.node(data, bounds, id === 'new')
    dom.node.classList.add('listless__body')
    return dom
  },

}


},{}],9:[function(require,module,exports){

module.exports = DumbPL

function DumbPL() {
  this.data = {}
}

DumbPL.prototype = {
  save: function (type, id, data) {
  },
  update: function (type, id, update) {
  },
  findAll: function (type) {
    return new Promise(function (res, rej) {
      res([])
    })
  },
  remove: function (type, id) {
  }
}


},{}],10:[function(require,module,exports){

module.exports = keys

var KEYS = {
  8: 'backspace',
  9: 'tab',
  13: 'return',
  27: 'escape',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  46: 'delete',
  113: 'f2',
  219: '[',
  221: ']'
}

function keyName(code) {
  if (code <= 90 && code >= 65) {
    return String.fromCharCode(code + 32)
  }
  return KEYS[code]
}

function keys(config) {
  var kmap = {}
    , prefixes = {}
    , cur_prefix = null
    , parts
    , part
    , seq
  for (var name in config) {
    parts = name.split(',')
    for (var i=0;i<parts.length;i++) {
      part = parts[i].trim()
      kmap[part] = config[name]
      if (part.indexOf(' ') !== -1) {
        seq = part.split(/\s+/g)
        var n = ''
        for (var j=0; j<seq.length-1; j++) {
          n += seq[j]
          prefixes[n] = true
        }
      }
    }
  }
  return function (e) {
    var name = keyName(e.keyCode)
    if (!name) {
      return console.log(e.keyCode)
    }
    if (e.altKey) name = 'alt+' + name
    if (e.shiftKey) name = 'shift+' + name
    if (e.ctrlKey) name = 'ctrl+' + name
    if (cur_prefix) {
      name = cur_prefix + ' ' + name
      cur_prefix = null
    }
    if (!kmap[name]) {
      if (prefixes[name]) {
        cur_prefix = name
      } else {
        cur_prefix = null
      }
      return
    }
    if (kmap[name].call(this, e) !== true) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }
}



},{}],11:[function(require,module,exports){

module.exports = LocalPL

function LocalPL() {
}

LocalPL.prototype = {
  save: function (type, id, data) {
    console.log('saving', type, data)
    localStorage[type + ':' + id] = JSON.stringify(data)
  },
  find: function (type, id) {
    return JSON.parse(localStorage[type + ':' + id])
  },
  update: function (type, id, update) {
    var node = this.find(type, id)
    console.log('updating!', type, id, update, node)
    for (var name in update) {
      node[name] = update[name]
    }
    this.save(type, id, node)
  },
  remove: function (type, id) {
    console.log('removing', type, id)
    delete localStorage[type + ':' + id]
  },
  findAll: function (type) {
    var items = []
    for (var name in localStorage) {
      if (name.indexOf(type + ':') !== 0) {
        continue;
      }
      items.push(JSON.parse(localStorage[name]))
    }
    return new Promise(function (res, rej) {
      res(items)
    })
  },
}


},{}],12:[function(require,module,exports){

module.exports = MemPL

function MemPL() {
  this.data = {}
}

MemPL.prototype = {
  save: function (type, id, data) {
    if (!this.data[type]) {
      this.data[type] = {}
    }
    this.data[type][id] = data
  },
  update: function (type, id, update) {
    for (var name in update) {
      this.data[type][id][name] = update[name]
    }
  },
  findAll: function (type) {
    var items = []
    if (this.data[type]) {
      for (var id in this.data[type]) {
        items.push(this.data[type][id])
      }
    }
    return new Promise(function (res, rej) {
      res(items)
    })
  },
  remove: function (type, id) {
    delete this.data[type][id]
  }
}


},{}],13:[function(require,module,exports){

module.exports = Model


function Model(root, ids, db) {
  this.ids = ids
  this.root = root
  this.db = db
  this.nextid = 100
  this.clipboard = false
}

/**
 * A single node is
 * - id:
 * - parent: id
 * - children: [id, id, id]
 * - data: {}
 */

Model.prototype = {
  newid: function () {
    while (this.ids[this.nextid]) {
      this.nextid += 1
    }
    var id = this.nextid
    this.nextid += 1
    return id
  },

  dumpData: function (id, noids) {
    if (arguments.length === 0) {
      id = this.root
    }
    var res = {}
      , n = this.ids[id]
    for (var name in n.data) {
      res[name] = n.data[name]
    }
    if (n.children.length) {
      res.children = []
      for (var i=0; i<n.children.length; i++) {
        res.children.push(this.dumpData(n.children[i], noids))
      }
    }
    if (!noids) res.id = id
    res.collapsed = n.collapsed
    return res
  },

  createNodes: function (pid, index, data) {
    var cr = this.create(pid, index, data.name)
    cr.node.collapsed = data.collapsed
    if (data.children) {
      for (var i=0; i<data.children.length; i++) {
        this.createNodes(cr.node.id, i, data.children[i])
      }
    }
    return cr
  },

  getBefore: function (pid, index) {
    var before = false
    if (index < this.ids[pid].children.length - 1) {
      before = this.ids[pid].children[index + 1]
    }
    return before
  },

  // operations
  create: function (pid, index, text) {
    var node = {
      id: this.newid(),
      data: {name: text || '', done: false},
      parent: pid,
      children: []
    }
    this.ids[node.id] = node
    this.ids[pid].children.splice(index, 0, node.id)

    var before = false
    if (index < this.ids[pid].children.length - 1) {
      before = this.ids[pid].children[index + 1]
    }

    this.db.save('node', node.id, node)
    this.db.update('node', pid, {children: this.ids[pid].children})

    return {
      node: node,
      before: before
    }
  },
  remove: function (id) {
    if (id === this.root) return
    var n = this.ids[id]
      , p = this.ids[n.parent]
      , ix = p.children.indexOf(id)
    p.children.splice(ix, 1)
    delete this.ids[id]

    this.db.remove('node', id)
    this.db.update('node', n.parent, {children: p.children})
    // TODO: remove all child nodes

    return {id: id, node: n, ix: ix}
  },
  setAttr: function (id, attr, value) {
    this.ids[id].data[attr] = value
    this.db.update('node', id, {data: this.ids[id].data})
  },
  setData: function (id, data) {
    for (var name in data) {
      this.ids[id].data[name] = data[name]
    }
    this.db.update('node', id, data)
  },

  // other stuff
  setCollapsed: function (id, isCollapsed) {
    this.ids[id].collapsed = isCollapsed
    this.db.update('node', id, {collapsed: isCollapsed})
  },
  isCollapsed: function (id) {
    return this.ids[id].collapsed
  },
  hasChildren: function (id) {
    return this.ids[id].children.length
  },
  // add back something that was removed
  readd: function (saved) {
    this.ids[saved.id] = saved.node
    var children = this.ids[saved.node.parent].children
    children.splice(saved.ix, 0, saved.id)
    var before = false
    if (saved.ix < children.length - 1) {
      before = children[saved.ix + 1]
    }
    this.db.save('node', saved.node.id, saved.node)
    this.db.update('node', saved.node.parent, {children: children})
    return before
  },
  move: function (id, pid, index) {
    var n = this.ids[id]
      , opid = n.parent
      , p = this.ids[opid]
      , ix = p.children.indexOf(id)
    p.children.splice(ix, 1)
    if (index === false) index = this.ids[pid].children.length
    this.ids[pid].children.splice(index, 0, id)
    this.ids[id].parent = pid

    this.db.update('node', opid, {children: p.children})
    this.db.update('node', pid, {children: this.ids[pid].children})
    this.db.update('node', id, {parent: pid})

    var before = false
    if (index < this.ids[pid].children.length - 1) {
      before = this.ids[pid].children[index + 1]
    }
    return before
  },
  appendText: function (id, text) {
    this.ids[id].data.name += text
    this.db.update('node', id, {data: this.ids[id].data})
  },

  // movement calculation
  getParent: function (id) {
    return this.ids[id].parent
  },
  commonParent: function (one, two) {
    if (one === two) return one
    var ones = [one]
      , twos = [two]
    while (this.ids[one].parent || this.ids[two].parent) {
      if (this.ids[one].parent) {
        one = this.ids[one].parent
        if (twos.indexOf(one) !== -1) return one
        ones.push(one)
      }
      if (this.ids[two].parent) {
        two = this.ids[two].parent
        if (ones.indexOf(two) !== -1) return two
        twos.push(two)
      }
    }
    return null
  },
  getChild: function (id) {
    if (this.ids[id].children && this.ids[id].children.length) {
      return this.ids[id].children[0]
    }
    return this.nextSibling(id)
  },
  prevSibling: function (id, noparent) {
    var pid = this.ids[id].parent
    if (undefined === pid) return
    var ix = this.ids[pid].children.indexOf(id)
    if (ix > 0) return this.ids[pid].children[ix-1]
    if (!noparent) return pid
  },
  nextSibling: function (id, strict) {
    var pid = this.ids[id].parent
    if (undefined === pid) return !strict && this.ids[id].children[0]
    var ix = this.ids[pid].children.indexOf(id)
    if (ix < this.ids[pid].children.length - 1) return this.ids[pid].children[ix + 1]
    if (this.ids[id].collapsed) {
      return !strict && this.nextSibling(pid, strict)
    }
    return !strict && this.ids[id].children[0]
  },
  lastSibling: function (id, strict) {
    var pid = this.ids[id].parent
    if (undefined === pid) return !strict && this.ids[id].children[0]
    var ix = this.ids[pid].children.indexOf(id)
    if (ix === this.ids[pid].children.length - 1) return !strict && this.ids[id].children[0]
    return this.ids[pid].children[this.ids[pid].children.length - 1]
  },
  firstSibling: function (id, strict) {
    var pid = this.ids[id].parent
    if (undefined === pid) return // this.ids[id].children[0]
    var ix = this.ids[pid].children.indexOf(id)
    if (ix === 0) return !strict && pid
    return this.ids[pid].children[0]
  },
  lastOpen: function (id) {
    var node = this.ids[id]
    while (node.children.length && (node.id === id || !node.collapsed)) {
      node = this.ids[node.children[node.children.length - 1]]
    }
    return node.id
  },
  idAbove: function (id) {
    var pid = this.ids[id].parent
      , parent = this.ids[pid]
    if (!parent) return
    var ix = parent.children.indexOf(id)
    if (ix === 0) {
      return pid
    }
    var previd = parent.children[ix - 1]
    while (this.ids[previd].children &&
           this.ids[previd].children.length &&
           !this.ids[previd].collapsed) {
      previd = this.ids[previd].children[this.ids[previd].children.length - 1]
    }
    return previd
  },
  // get the place to shift left to
  shiftLeftPlace: function (id) {
    var pid = this.ids[id].parent
      , parent = this.ids[pid]
    if (!parent) return
    var ppid = parent.parent
      , pparent = this.ids[ppid]
    if (!pparent) return
    var pix = pparent.children.indexOf(pid)
    return {
      pid: ppid,
      ix: pix + 1
    }
  },
  shiftUpPlace: function (id) {
    var pid = this.ids[id].parent
      , parent = this.ids[pid]
    if (!parent) return
    var ix = parent.children.indexOf(id)
    if (ix === 0) {
      var pl = this.shiftLeftPlace(id)
      if (!pl) return
      pl.ix -= 1
      return pl
    }
    return {
      pid: pid,
      ix: ix - 1
    }
  },
  shiftDownPlace: function (id) {
    var pid = this.ids[id].parent
      , parent = this.ids[pid]
    if (!parent) return
    var ix = parent.children.indexOf(id)
    if (ix >= parent.children.length - 1) {
      return this.shiftLeftPlace(id)
    }
    return {
      pid: pid,
      ix: ix + 1
    }
  },
  moveBeforePlace: function (id, tid) {
    var sib = this.ids[id]
      , pid = sib.parent
      , opid = this.ids[tid].parent
    if (undefined === pid) return
    var parent = this.ids[pid]
    return {
      pid: pid,
      ix: parent.children.indexOf(id)
    }
  },
  moveAfterPlace: function (id, oid) {
    var sib = this.ids[id]
      , pid = sib.parent
      , opid = this.ids[oid].parent
    if (undefined === pid) return
    var oix = this.ids[opid].children.indexOf(oid)
    var parent = this.ids[pid]
      , ix = parent.children.indexOf(id) + 1
    if ( pid === opid && ix > oix) ix -= 1
    return {
      pid: pid,
      ix: ix
    }
  },
  idBelow: function (id, root) {
    if (this.ids[id].children &&
        this.ids[id].children.length &&
        (id === root || !this.ids[id].collapsed)) {
      return this.ids[id].children[0]
    }
    var pid = this.ids[id].parent
      , parent = this.ids[pid]
    if (!parent) return
    var ix = parent.children.indexOf(id)
    while (ix === parent.children.length - 1) {
      parent = this.ids[parent.parent]
      if (!parent) return
      ix = parent.children.indexOf(pid)
      pid = parent.id
    }
    return parent.children[ix + 1]
  },
  idNew: function (id, before, root) {
    var pid = this.ids[id].parent
      , parent
      , nix
    if (before) {
      parent = this.ids[pid]
      nix = parent.children.indexOf(id)
    } else if (id === this.root ||
        root === id ||
        (this.ids[id].children &&
        this.ids[id].children.length &&
        !this.ids[id].collapsed)) {
      pid = id
      nix = 0
    } else {
      parent = this.ids[pid]
      nix = parent.children.indexOf(id) + 1
    }
    return {
      pid: pid,
      index: nix
    }
  },
  samePlace: function (id, place) {
    var pid = this.ids[id].parent
    if (!pid || pid !== place.pid) return false
    var parent = this.ids[pid]
      , ix = parent.children.indexOf(id)
    return ix === place.ix
  },
  findCollapser: function (id) {
    if ((!this.ids[id].children ||
         !this.ids[id].children.length ||
         this.ids[id].collapsed) &&
        this.ids[id].parent !== undefined) {
      id = this.ids[id].parent
    }
    return id
  },
}


},{}],14:[function(require,module,exports){

module.exports = {
  extend: extend,
  merge: merge,
  make_listed: make_listed
}

function merge(a, b) {
  var c = {}
    , name
  for (name in a) {
    c[name] = a[name]
  }
  for (name in b) {
    c[name] = b[name]
  }
  return c
}

function extend(a, b) {
  for (var c in b) {
    a[c] = b[c]
  }
  return a
}

function load(db, tree) {
  var res = make_listed(tree, undefined, true)
  db.save('root', {id: res.id})
  for (var i=0; i<res.tree.length; i++) {
    db.save('node', res.tree[i])
  }
}

function make_listed(data, nextid, collapse) {
  var ids = {}
    , children = []
    , ndata = {}
    , res
    , i
  if (undefined === nextid) nextid = 100

  if (data.children) {
    for (i=0; i<data.children.length; i++) {
      res = make_listed(data.children[i], nextid, collapse)
      for (var id in res.tree) {
        ids[id] = res.tree[id]
        ids[id].depth += 1
      }
      children.push(res.id)
      nextid = res.id + 1
    }
    // delete data.children
  }
  for (var name in data) {
    if (name === 'children') continue;
    ndata[name] = data[name]
  }
  ndata.done = false
  var theid = data.id || nextid
  ids[theid] = {
    id: theid,
    data: ndata,
    children: children,
    collapsed: !!collapse,
    depth: 0
  }
  for (i=0; i<children.length; i++) {
    ids[children[i]].parent = theid;
  }
  return {id: theid, tree: ids}
}




},{}],15:[function(require,module,exports){

module.exports = View

function reversed(items) {
  var nw = []
  for (var i=items.length; i>0; i--) {
    nw.push(items[i - 1])
  }
  return nw
}

var DomViewLayer = require('./dom-vl')
  , DefaultNode = require('./default-node')
  , DungeonsAndDragons = require('./dnd')
  , keys = require('./keys')
  , util = require('./util')

function View(bindActions, model, ctrl, options) {
  options = options || {}
  this.mode = 'normal'
  this.selection = null
  this.sel_inverted = false
  this.active = null
  this.o = util.extend({
    node: DefaultNode,
    ViewLayer: DomViewLayer,
    noSelectRoot: false
  }, options)
  this.o.keybindings = util.merge(this.default_keys, options.keys)
  this.vl = new this.o.ViewLayer(this.o)
  this.bindActions = bindActions
  this.model = model
  this.ctrl = ctrl
  this.dnd = new DungeonsAndDragons(this.vl, ctrl.actions.move.bind(ctrl))
  this.lazy_children = {}

  this.newNode = null
  this.attachListeners()
}

View.prototype = {
  rebase: function (newroot, trigger) {
    this.vl.clear()
    var root = this.vl.root
    this.initialize(newroot)
    this.vl.rebase(root)
    this.ctrl.trigger('rebase', newroot)
  },
  initialize: function (root) {
    var node = this.model.ids[root]
      , rootNode = this.vl.makeRoot(node, this.bindActions(root))
    this.active = null
    this.selection = null
    this.lazy_children = {}
    this.root = root
    this.populateChildren(root)
    if (!node.children.length) {
      this.addNew(this.root, 0)
    }
    this.selectSomething()
    return rootNode
  },
  startMoving: function (id) {
    var targets = this.vl.dropTargets(this.root, this.model, id, true)
    this.dnd.startMoving(targets, id)
  },
  addNew: function (pid, index) {
    this.newNode = {
      pid: pid,
      index: index
    }
    var before = this.model.getBefore(pid, index-1)
    this.vl.addNew({
      id: 'new',
      data: {name: ''},
      parent: pid
    }, this.bindActions('new'), before)
  },
  removeNew: function () {
    if (!this.newNode) return false
    var nw = this.newNode
      , lastchild = !this.model.ids[nw.pid].children.length
    this.vl.remove('new', nw.pid, lastchild)
    this.newNode = null
    return nw
  },
  selectSomething: function () {
    var child
    if (!this.model.ids[this.root].children.length) {
      child = 'new'
    } else {
      child = this.model.ids[this.root].children[0]
    }
    this.goTo(child)
  },
  populateChildren: function (id) {
    var node = this.model.ids[id]
    if (node.collapsed && id !== this.root) {
      this.lazy_children[id] = true
      return
    }
    this.lazy_children[id] = false
    if (!node.children || !node.children.length) return
    for (var i=0; i<node.children.length; i++) {
      this.add(this.model.ids[node.children[i]], false, true)
      this.populateChildren(node.children[i])
    }
  },
  goTo: function (id) {
    if (this.mode === 'insert') {
      this.startEditing(id)
    } else {
      this.setActive(id)
    }
  },

  default_keys: {
    'cut': 'ctrl+x, delete, d d',
    'copy': 'ctrl+c, y y',
    'paste': 'p, ctrl+v',
    'paste above': 'shift+p, ctrl+shift+v',
    'visual mode': 'v, shift+v',

    'edit': 'return, a, shift+a, f2',
    'edit start': 'i, shift+i',
    'first sibling': 'shift+[',
    'last sibling': 'shift+]',
    'move to first sibling': 'shift+alt+[',
    'move to last sibling': 'shift+alt+]',
    'new after': 'o',
    'new before': 'shift+o',
    'jump to top': 'g g',
    'jump to bottom': 'shift+g',
    'up': 'up, k',
    'down': 'down, j',
    'left': 'left, h',
    'right': 'right, l',
    'next sibling': 'alt+j, alt+down',
    'prev sibling': 'alt+k, alt+up',
    'toggle collapse': 'z',
    'collapse': 'alt+h, alt+left',
    'uncollapse': 'alt+l, alt+right',
    'indent': 'tab, shift+alt+l, shift+alt+right',
    'dedent': 'shift+tab, shift+alt+h, shift+alt+left',
    'move down': 'shift+alt+j, shift+alt+down',
    'move up': 'shift+alt+k, shift+alt+up',
    'undo': 'ctrl+z, u',
    'redo': 'ctrl+shift+z, shift+r',
  },

  actions: {
    'cut': function () {
      if (this.active === null) return
      this.ctrl.actions.cut(this.active)
    },
    'copy': function () {
      if (this.active === null) return
      this.ctrl.actions.copy(this.active)
    },
    'paste': function () {
      if (this.active === null) return
      this.ctrl.actions.paste(this.active)
    },
    'paste above': function () {
      if (this.active === null) return
      this.ctrl.actions.paste(this.active, true)
    },
    'visual mode': function () {
      if (this.active === this.root) return
      this.setSelection([this.active])
    },

    'undo': function () {
      this.ctrl.undo();
    },
    'redo': function () {
      this.ctrl.redo();
    },
    'edit': function () {
      if (this.active === null) {
        this.active = this.root
      }
      this.vl.body(this.active).startEditing()
    },
    'edit start': function () {
      if (this.active === null) {
        this.active = this.root
      }
      this.vl.body(this.active).startEditing(true)
    },
    // nav
    'first sibling': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return this.setActive(this.root)
      var first = this.model.firstSibling(this.active)
      if (undefined === first) return
      this.setActive(first)
    },
    'last sibling': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return this.setActive(this.root)
      var last = this.model.lastSibling(this.active)
      if (undefined === last) return
      this.setActive(last)
    },
    'jump to top': function () {
      this.setActive(this.root)
    },
    'jump to bottom': function () {
      this.setActive(this.model.lastOpen(this.root))
      console.log('bottom')
      // pass
    },
    'up': function () {
      if (this.active === null) {
        this.setActive(this.root)
      } else {
        if (this.active === 'new') return this.setActive(this.root)
        var top = this.active
          , above = this.model.idAbove(top)
        if (above === undefined) above = top
        if (above === this.root && this.o.noSelectRoot) {
          return
        }
        this.setActive(above)
      }
    },
    'down': function () {
      if (this.active === null) {
        this.setActive(this.root)
      } else {
        if (this.active === 'new') return
        if (this.active === this.root &&
            !this.model.ids[this.root].children.length) {
          return this.setActive('new')
        }
        var top = this.active
          , above = this.model.idBelow(top, this.root)
        if (above === undefined) above = top
        this.setActive(above)
      }
    },
    'left': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return this.setActive(this.root)
      var left = this.model.getParent(this.active)
      if (undefined === left) return
      this.setActive(left)
    },
    'right': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return
      if (this.active === this.root &&
          !this.model.ids[this.root].children.length) {
        return this.setActive('new')
      }
      var right = this.model.getChild(this.active)
      if (this.model.isCollapsed(this.active)) return
      if (undefined === right) return
      this.setActive(right)
    },
    'next sibling': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return
      var sib = this.model.nextSibling(this.active)
      if (undefined === sib) return
      this.setActive(sib)
    },
    'prev sibling': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return this.setActive(this.root)
      var sib = this.model.prevSibling(this.active)
      if (undefined === sib) return
      this.setActive(sib)
    },
    'move to first sibling': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return
      this.ctrl.actions.moveToTop(this.active)
    },
    'move to last sibling': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      if (this.active === 'new') return
      this.ctrl.actions.moveToBottom(this.active)
    },
    'new before': function () {
      if (this.active === null) return
      if (this.active === 'new') return this.startEditing()
      this.ctrl.addBefore(this.active)
      this.startEditing()
    },
    'new after': function () {
      if (this.active === null) return
      if (this.active === 'new') return this.startEditing()
      this.ctrl.actions.addAfter(this.active)
      this.startEditing()
    },
    // movez!
    'toggle collapse': function () {
      this.ctrl.actions.toggleCollapse(this.active)
    },
    'collapse': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      this.ctrl.actions.toggleCollapse(this.active, true)
    },
    'uncollapse': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      this.ctrl.actions.toggleCollapse(this.active, false)
    },
    'indent': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      this.ctrl.actions.moveRight(this.active)
    },
    'dedent': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      this.ctrl.actions.moveLeft(this.active)
    },
    'move down': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      this.ctrl.actions.moveDown(this.active)
    },
    'move up': function () {
      if (this.active === null) {
        return this.setActive(this.root)
      }
      this.ctrl.actions.moveUp(this.active)
    }
  },

  visual: {
    // movement
    'k, up': function () {
      var prev = this.model.prevSibling(this.active, true)
      if (!prev) return
      this.addToSelection(prev, true)
    },
    'j, down': function () {
      var next = this.model.nextSibling(this.active, true)
      if (!next) return
      this.addToSelection(next, false)
    },
    'shift+g': function () {
      var n = this.model.ids[this.selection[0]]
        , ch = this.model.ids[n.parent].children
        , ix = ch.indexOf(this.selection[0])
      this.setSelection(ch.slice(ix))
      this.sel_inverted = false
      this.setActive(ch[ch.length-1])
    },
    'g g': function () {
      var n = this.model.ids[this.selection[0]]
        , ch = this.model.ids[n.parent].children
        , ix = ch.indexOf(this.selection[0])
        , items = []
      for (var i=0; i<=ix; i++) {
        items.unshift(ch[i])
      }
      this.setSelection(items)
      this.sel_inverted = items.length > 1
      this.setActive(ch[0])
    },
    'v, shift+v, escape': function () {
      this.stopSelecting()
    },
    'i, a, shift+a': function () {
      this.startEditing(this.active)
    },
    'shift+i': function () {
      this.startEditing(this.active, true)
    },

    // editness
    'd, shift+d, ctrl+x': function () {
      var items = this.selection.slice()
      if (this.sel_inverted) {
        items = reversed(items)
      }
      this.ctrl.actions.cut(items)
      this.stopSelecting()
    },
    'y, shift+y, ctrl+c': function () {
      var items = this.selection.slice()
      if (this.sel_inverted) {
        items = reversed(items)
      }
      this.ctrl.actions.copy(items)
      this.stopSelecting()
    },
    'u, ctrl+z': function () {
      this.stopSelecting()
      this.ctrl.undo()
    },
    'shift+r, ctrl+shift+z': function () {
      this.stopSelecting()
      this.ctrl.redo()
    }
  },

  extra_actions: {},

  keyHandler: function () {
    var normal = {}
      , name
    for (name in this.o.keybindings) {
      if (!this.actions[name]) {
        throw new Error('Invalid configuration! Unknown action: ' + name)
      }
      normal[this.o.keybindings[name]] = this.actions[name]
    }

    if (this.extra_actions) {
      for (name in this.extra_actions) {
        if (!normal[name]) {
          normal[this.extra_actions[name].binding] = this.extra_actions[name].action
        }
      }
    }

    var handlers = {
      'insert': function () {},
      'normal': keys(normal),
      'visual': keys(this.visual)
    }

    return function () {
      return handlers[this.mode].apply(this, arguments)
    }.bind(this)
  },

  attachListeners: function () {
    var keydown = this.keyHandler()
    window.addEventListener('keydown', function (e) {
      if (this.mode === 'insert') return
      keydown.call(this, e)
    }.bind(this))
  },

  addTree: function (node, before) {
    if (!this.vl.body(node.parent)) {
      return this.rebase(node.parent, true)
    }
    this.add(node, before)
    if (!node.children.length) return
    for (var i=0; i<node.children.length; i++) {
      this.addTree(this.model.ids[node.children[i]], false)
    }
  },

  // operations
  add: function (node, before, dontfocus) {
    var ed = this.mode === 'insert'
      , children = !!node.children.length
    if (!this.vl.body(node.parent)) {
      return this.rebase(node.parent, true)
    }
    this.vl.addNew(node, this.bindActions(node.id), before, children)
    if (!dontfocus) {
      if (ed) {
        this.vl.body(node.id).startEditing()
      } else {
        this.setActive(node.id)
      }
    }
  },
  remove: function (id) {
    var pid = this.model.ids[id].parent
      , parent = this.model.ids[pid]
    if (!this.vl.body(id)) {
      return this.rebase(pid, true)
    }
    if (id === this.active) {
      this.setActive(this.root)
    }
    this.vl.remove(id, pid, parent && parent.children.length === 1)
    if (parent.children.length === 1 && pid === this.root) {
      setTimeout(function () {
      this.addNew(pid, 0)
      }.bind(this),0)
    }
  },
  setAttr: function (id, attr, value) {
    if (!this.vl.body(id)) {
      return this.rebase(id, true)
    }
    this.vl.body(id).setAttr(attr, value)
    if (this.mode === 'insert') {
      this.vl.body(id).startEditing()
    }
  },
  setData: function (id, data) {
    this.vl.body(id).setData(data)
    if (this.mode === 'insert') {
      this.vl.body(id).startEditing()
    }
  },
  appendText: function (id, text) {
    this.vl.body(id).addEditText(text)
  },
  move: function (id, pid, before, ppid, lastchild) {
    if (!this.vl.body(id)) {
      return this.rebase(this.model.commonParent(pid, ppid), true)
    }
    var ed = this.mode === 'insert'
    this.vl.move(id, pid, before, ppid, lastchild)
    if (ed) this.startEditing(id)
  },
  startEditing: function (id, fromStart) {
    if (arguments.length === 0) {
      id = this.active !== null ? this.active : this.root
    }
    if (id === this.root && this.o.noSelectRoot) {
      return
    }
    var body = this.vl.body(id)
    if (!body) return
    body.startEditing(fromStart)
  },
  setEditing: function (id) {
    if (this.mode === 'visual') {
      this.stopSelecting()
    }
    this.mode = 'insert'
    this.setActive(id)
  },
  doneEditing: function () {
    this.mode = 'normal'
  },
  setActive: function (id) {
    if (id === this.active) return
    if (this.active !== null) {
      this.vl.clearActive(this.active)
    }
    if (!this.vl.dom[id]) {
      id = this.root
    }
    this.active = id
    this.vl.showActive(id)
  },
  addToSelection: function (id, invert) {
    var ix = this.selection.indexOf(id)
    if (ix === -1) {
      this.selection.push(id)
      this.vl.showSelection([id])
      this.sel_inverted = invert
    } else {
      this.vl.clearSelection(this.selection.slice(ix + 1))
      this.selection = this.selection.slice(0, ix + 1)
      if (this.selection.length === 1) {
        this.sel_inverted = false
      }
    }
    this.setActive(id)
    console.log(this.sel_inverted)
  },
  setSelection: function (sel) {
    this.mode = 'visual'
    this.sel_inverted = false
    if (this.selection) {
      this.vl.clearSelection(this.selection)
    }
    this.selection = sel
    this.vl.showSelection(sel)
  },
  stopSelecting: function () {
    if (this.selection !== null) {
      this.vl.clearSelection(this.selection)
      this.selection = null
    }
    this.mode = 'normal'
  },
  setCollapsed: function (id, what) {
    /*
    if (!this.vl.body(id)) {
      return this.rebase(this.model.ids[id].parent)
    }
    */
    this.vl.setCollapsed(id, what)
    if (what) {
      if (this.mode === 'insert') {
        this.startEditing(id)
      } else {
        this.setActive(id)
      }
    } else {
      if (this.lazy_children[id]) {
        this.populateChildren(id)
      }
    }
    // TODO: event listeners?
  },

  // non-modifying stuff
  goUp: function (id) {
    // should I check to see if it's ok?
    var above = this.model.idAbove(id)
    if (above === false) return
    if (above === this.root && this.o.noSelectRoot) {
      return
    }
    this.vl.body(above).body.startEditing();
  },
  goDown: function (id, fromStart) {
    var below = this.model.idBelow(id, this.root)
    if (below === false) return
    this.vl.body(below).body.startEditing(fromStart)
  },
}


},{"./default-node":6,"./dnd":7,"./dom-vl":8,"./keys":10,"./util":14}],16:[function(require,module,exports){


var d = React.DOM
  , lib = require('./index')
  , util = require('./lib/util')
  , MemPL = require('./lib/mem-pl')

var PLs = {
  'Local': require('./lib/local-pl'),
  'Mem': require('./lib/mem-pl'),
  'Dumb': require('./lib/dumb-pl')
}

var MainApp = React.createClass({
  getDefaultProps: function () {
    return {
      db: null
    }
  },
  getInitialState: function () {
    return {
      lineage: [],
      model: null,
      loading: true
    }
  },
  changeBread: function (id) {
    this.refs.wf.wf.actions.clickBullet(id)
  },
  updateBread: function (lineage) {
    this.setState({lineage: lineage})
  },
  componentDidMount: function () {
    var db = this.props.db
      , that = this
    db.findAll('root').then(function (roots) {
      if (!roots.length) {
        // load default
        db.save('root', 50, {id: 50})
        var tree = {
          50: {
            id: 50,
            children: [],
            collapsed: false,
            data: {name: 'Home'},
            depth: 0
          }
        }
        db.save('node', 50, tree[50])
        var model = window.model = new lib.Model(50, tree, db)
        return that.setState({loading: false, model: model})
      }
      db.findAll('node').then(function (nodes) {
        var tree = {}
          , id = roots[0].id
        for (var i=0; i<nodes.length; i++) {
          tree[nodes[i].id] = nodes[i]
        }
        var model = window.model = new lib.Model(id, tree, db)
        return that.setState({loading: false, model: model})
      })
    })
  },
  render: function () {
    if (this.state.loading) {
      return d.div({className: 'workflowme'}, 'Loading...')
    }
    return d.div({
      className: 'workflowme'
    }, History({items: this.state.lineage, onClick: this.changeBread}),
       Workflowy({
         ref: 'wf',
         model: this.state.model,
         onBreadCrumb: this.updateBread
      })
    )
  }
})

var Workflowy = React.createClass({
  componentDidMount: function () {
    this.wf = new lib.Controller(this.props.model, {onBullet: this.props.onBreadCrumb})
    this.wf.on('rebase', function (root) {
      this.props.onBreadCrumb(this.props.model.getLineage(root))
    }.bind(this))
    this.getDOMNode().appendChild(this.wf.node)
  },
  render: function () {
    return d.div()
  }
})

var History = React.createClass({
  getDefaultProps: function () {
    return {
      items: [],
      onClick: function () {}
    }
  },
  mouseDown: function (id, e) {
    if (e.button !== 0) return
    this.props.onClick(id)
  },
  render: function () {
    var that = this
    return d.ul(
      {className: 'breadcrumb'},
      this.props.items.slice(0, -1).map(function (item, i) {
        return d.li({
          key: item.id,
          className: 'listless__bread',
          onMouseDown: that.mouseDown.bind(null, item.id),
          dangerouslySetInnerHTML: {
            __html: marked(item.name)
          }
        })
      })
    )
  }
})

if ('string' === typeof window.PL) {
  window.PL = new PLs[window.PL]()
}

var base = document.getElementById('example')

React.renderComponent(MainApp({
  db: window.PL,
  // id: data.id,
  // tree: data.tree
}), base)



},{"./index":1,"./lib/dumb-pl":9,"./lib/local-pl":11,"./lib/mem-pl":12,"./lib/util":14}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL3RyZWVkL2RlbW8vd29ya2Zsb3d5L2luZGV4LmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL3RyZWVkL2RlbW8vd29ya2Zsb3d5L2xpYi9iYXNlLW5vZGUuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvdHJlZWQvZGVtby93b3JrZmxvd3kvbGliL2NvbW1hbmRlZ2VyLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL3RyZWVkL2RlbW8vd29ya2Zsb3d5L2xpYi9jb21tYW5kcy5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS90cmVlZC9kZW1vL3dvcmtmbG93eS9saWIvY29udHJvbGxlci5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS90cmVlZC9kZW1vL3dvcmtmbG93eS9saWIvZGVmYXVsdC1ub2RlLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL3RyZWVkL2RlbW8vd29ya2Zsb3d5L2xpYi9kbmQuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvdHJlZWQvZGVtby93b3JrZmxvd3kvbGliL2RvbS12bC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS90cmVlZC9kZW1vL3dvcmtmbG93eS9saWIvZHVtYi1wbC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS90cmVlZC9kZW1vL3dvcmtmbG93eS9saWIva2V5cy5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS90cmVlZC9kZW1vL3dvcmtmbG93eS9saWIvbG9jYWwtcGwuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvdHJlZWQvZGVtby93b3JrZmxvd3kvbGliL21lbS1wbC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS90cmVlZC9kZW1vL3dvcmtmbG93eS9saWIvbW9kZWwuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvdHJlZWQvZGVtby93b3JrZmxvd3kvbGliL3V0aWwuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvdHJlZWQvZGVtby93b3JrZmxvd3kvbGliL3ZpZXcuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvdHJlZWQvZGVtby93b3JrZmxvd3kvc2V0dXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnZhciBEZWZhdWx0Tm9kZSA9IHJlcXVpcmUoJy4vbGliL2RlZmF1bHQtbm9kZScpXG4gICwgRG9tVmlld0xheWVyID0gcmVxdWlyZSgnLi9saWIvZG9tLXZsJylcbiAgLCBWaWV3ID0gcmVxdWlyZSgnLi9saWIvdmlldycpXG4gICwgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vbGliL2NvbnRyb2xsZXInKVxuICAsIE1vZGVsID0gcmVxdWlyZSgnLi9saWIvbW9kZWwnKVxuICAsIHV0aWwgPSByZXF1aXJlKCcuL2xpYi91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE1vZGVsOiBXRk1vZGVsLFxuICBDb250cm9sbGVyOiBXRkNvbnRyb2xsZXJcbn1cblxuZnVuY3Rpb24gV0ZOb2RlKGRhdGEsIG9wdGlvbnMsIGlzTmV3KSB7XG4gIERlZmF1bHROb2RlLmNhbGwodGhpcywgZGF0YSwgb3B0aW9ucywgaXNOZXcpXG59XG5cbldGTm9kZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlZmF1bHROb2RlLnByb3RvdHlwZSlcbldGTm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXRk5vZGVcblxuV0ZOb2RlLnByb3RvdHlwZS5zZXRBdHRyID0gZnVuY3Rpb24gKGF0dHIsIHZhbHVlKSB7XG4gIGlmIChhdHRyICE9PSAnZG9uZScpIHtcbiAgICBEZWZhdWx0Tm9kZS5wcm90b3R5cGUuc2V0QXR0ci5jYWxsKHRoaXMsIGF0dHIsIHZhbHVlKVxuICAgIHJldHVyblxuICB9XG4gIHRoaXMuZG9uZSA9IHZhbHVlXG4gIGlmICh2YWx1ZSkge1xuICAgIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19fZGVmYXVsdC1ub2RlLS1kb25lJylcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnbGlzdGxlc3NfX2RlZmF1bHQtbm9kZS0tZG9uZScpXG4gIH1cbn1cblxuV0ZOb2RlLnByb3RvdHlwZS5leHRyYV9hY3Rpb25zID0ge1xuICAncmViYXNlJzoge1xuICAgIGJpbmRpbmc6ICdhbHQrcmV0dXJuJyxcbiAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuby5jbGlja0J1bGxldCgpXG4gICAgfVxuICB9LFxuICAnYmFjayBhIGxldmVsJzoge1xuICAgIGJpbmRpbmc6ICdzaGlmdCthbHQrcmV0dXJuJyxcbiAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuby5iYWNrQUxldmVsKClcbiAgICB9XG4gIH0sXG4gICd0b2dnbGUgZG9uZSc6IHtcbiAgICBiaW5kaW5nOiAnY3RybCtyZXR1cm4nLFxuICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5ibHVyKClcbiAgICAgIHRoaXMuby5jaGFuZ2VkKCdkb25lJywgIXRoaXMuZG9uZSlcbiAgICAgIHRoaXMuZm9jdXMoKVxuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aGlzLm8uZ29Eb3duKClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gV0ZWaWV3KCkge1xuICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuV0ZWaWV3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpXG5cbldGVmlldy5wcm90b3R5cGUuZXh0cmFfYWN0aW9ucyA9IHtcbiAgJ3JlYmFzZSc6IHtcbiAgICBiaW5kaW5nOiAnYWx0K3JldHVybicsXG4gICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5jbGlja0J1bGxldCh0aGlzLmFjdGl2ZSlcbiAgICB9XG4gIH0sXG4gICdiYWNrIGEgbGV2ZWwnOiB7XG4gICAgYmluZGluZzogJ3NoaWZ0K2FsdCtyZXR1cm4nLFxuICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jdHJsLmFjdGlvbnMuYmFja0FMZXZlbCgpXG4gICAgfVxuICB9LFxuICAndG9nZ2xlIGRvbmUnOiB7XG4gICAgYmluZGluZzogJ2N0cmwrcmV0dXJuJyxcbiAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gbnVsbCkgcmV0dXJuXG4gICAgICB2YXIgaWQgPSB0aGlzLmFjdGl2ZVxuICAgICAgICAsIGRvbmUgPSAhdGhpcy5tb2RlbC5pZHNbaWRdLmRhdGEuZG9uZVxuICAgICAgICAsIG5leHQgPSB0aGlzLm1vZGVsLmlkQmVsb3coaWQsIHRoaXMucm9vdClcbiAgICAgIGlmIChuZXh0ID09PSB1bmRlZmluZWQpIG5leHQgPSBpZFxuICAgICAgdGhpcy5jdHJsLmFjdGlvbnMuY2hhbmdlZCh0aGlzLmFjdGl2ZSwgJ2RvbmUnLCBkb25lKVxuICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgdGhpcy5nb1RvKG5leHQpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gV0ZDb250cm9sbGVyKG1vZGVsLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSB1dGlsLm1lcmdlKHtcbiAgICBWaWV3OiBXRlZpZXcsXG4gICAgdmlld09wdGlvbnM6IHtcbiAgICAgIFZpZXdMYXllcjogV0ZWTCxcbiAgICAgIG5vZGU6IFdGTm9kZVxuICAgIH0sXG4gICAgb25CdWxsZXQ6IGZ1bmN0aW9uICgpIHt9XG4gIH0sIG9wdGlvbnMpXG4gIENvbnRyb2xsZXIuY2FsbCh0aGlzLCBtb2RlbCwgb3B0aW9ucylcbiAgdGhpcy5vLm9uQnVsbGV0KHRoaXMubW9kZWwuZ2V0TGluZWFnZShtb2RlbC5yb290KSlcbn1cblxuV0ZDb250cm9sbGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29udHJvbGxlci5wcm90b3R5cGUpXG5cbldGQ29udHJvbGxlci5wcm90b3R5cGUuYWN0aW9ucyA9IHV0aWwuZXh0ZW5kKHtcbiAgY2xpY2tCdWxsZXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgIHRoaXMudmlldy5yZWJhc2UoaWQpXG4gICAgdGhpcy5vLm9uQnVsbGV0KHRoaXMubW9kZWwuZ2V0TGluZWFnZShpZCkpXG4gIH0sXG4gIGJhY2tBTGV2ZWw6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcm9vdCA9IHRoaXMudmlldy5yb290XG4gICAgICAsIHBpZCA9IHRoaXMubW9kZWwuaWRzW3Jvb3RdLnBhcmVudFxuICAgIGlmICghdGhpcy5tb2RlbC5pZHNbcGlkXSkgcmV0dXJuXG4gICAgdGhpcy5hY3Rpb25zLmNsaWNrQnVsbGV0KHBpZClcbiAgfVxufSwgQ29udHJvbGxlci5wcm90b3R5cGUuYWN0aW9ucylcblxuZnVuY3Rpb24gV0ZWTCgpIHtcbiAgRG9tVmlld0xheWVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuV0ZWTC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERvbVZpZXdMYXllci5wcm90b3R5cGUpXG5cbldGVkwucHJvdG90eXBlLm1ha2VIZWFkID0gZnVuY3Rpb24gKGJvZHksIGFjdGlvbnMpIHtcbiAgdmFyIGhlYWQgPSBEb21WaWV3TGF5ZXIucHJvdG90eXBlLm1ha2VIZWFkLmNhbGwodGhpcywgYm9keSwgYWN0aW9ucylcbiAgICAsIGJ1bGxldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGJ1bGxldC5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19fYnVsbGV0JylcbiAgYnVsbGV0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGFjdGlvbnMuY2xpY2tCdWxsZXQpXG4gIGhlYWQuaW5zZXJ0QmVmb3JlKGJ1bGxldCwgaGVhZC5jaGlsZE5vZGVzWzFdKVxuICByZXR1cm4gaGVhZFxufVxuXG5mdW5jdGlvbiBXRk1vZGVsKCkge1xuICBNb2RlbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbldGTW9kZWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNb2RlbC5wcm90b3R5cGUpXG5cbldGTW9kZWwucHJvdG90eXBlLmdldExpbmVhZ2UgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdmFyIGxpbmVhZ2UgPSBbXVxuICB3aGlsZSAodGhpcy5pZHNbaWRdKSB7XG4gICAgbGluZWFnZS51bnNoaWZ0KHtcbiAgICAgIG5hbWU6IHRoaXMuaWRzW2lkXS5kYXRhLm5hbWUsXG4gICAgICBpZDogaWRcbiAgICB9KVxuICAgIGlkID0gdGhpcy5pZHNbaWRdLnBhcmVudFxuICB9XG4gIHJldHVybiBsaW5lYWdlXG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBCYXNlTm9kZVxuXG52YXIga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpXG4gICwgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbmZ1bmN0aW9uIEJhc2VOb2RlKGRhdGEsIG9wdGlvbnMsIGlzTmV3KSB7XG4gIHRoaXMubmFtZSA9IGRhdGEubmFtZVxuICB0aGlzLmlzTmV3ID0gaXNOZXdcbiAgdGhpcy5vID0gb3B0aW9uc1xuICB0aGlzLm8ua2V5YmluZGluZ3MgPSB1dGlsLm1lcmdlKHRoaXMuZGVmYXVsdF9rZXlzLCBvcHRpb25zLmtleXMpXG5cbiAgdGhpcy5lZGl0aW5nID0gZmFsc2VcbiAgdGhpcy5zZXR1cE5vZGUoKTtcbn1cblxuQmFzZU5vZGUuYWRkQWN0aW9uID0gZnVuY3Rpb24gKG5hbWUsIGJpbmRpbmcsIGZ1bmMpIHtcbiAgaWYgKCF0aGlzLmV4dHJhX2FjdGlvbnMpIHtcbiAgICB0aGlzLmV4dHJhX2FjdGlvbnMgPSB7fVxuICB9XG4gIHRoaXMuZXh0cmFfYWN0aW9uc1tuYW1lXSA9IHtcbiAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgIGZ1bmM6IGZ1bmNcbiAgfVxufVxuXG5CYXNlTm9kZS5wcm90b3R5cGUgPSB7XG4gIC8vIHB1YmxpY1xuICBzdGFydEVkaXRpbmc6IGZ1bmN0aW9uIChmcm9tU3RhcnQpIHtcbiAgfSxcbiAgc3RvcEVkaXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgfSxcbiAgYWRkRWRpdFRleHQ6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIH0sXG4gIHNldERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gIH0sXG4gIHNldEF0dHI6IGZ1bmN0aW9uIChhdHRyLCB2YWx1ZSkge1xuICB9LFxuXG4gIC8vIHByb3RleHRlZFxuICBpc0F0U3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgfSxcbiAgaXNBdEVuZDogZnVuY3Rpb24gKCkge1xuICB9LFxuICBpc0F0Qm90dG9tOiBmdW5jdGlvbiAoKSB7XG4gIH0sXG4gIGlzQXRUb3A6IGZ1bmN0aW9uICgpIHtcbiAgfSxcblxuICBzZXR1cE5vZGU6IGZ1bmN0aW9uICgpIHtcbiAgfSxcbiAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gIH0sXG4gIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgfSxcbiAgc2V0VGV4dENvbnRlbnQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB9LFxuICBnZXRTZWxlY3Rpb25Qb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICB9LFxuXG5cbiAgLy8gU2hvdWxkIHRoZXJlIGJlIGEgY2FuU3RvcEVkaXRpbmc/XG4gIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGFydEVkaXRpbmcoKTtcbiAgfSxcbiAgYmx1cjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RvcEVkaXRpbmcoKTtcbiAgfSxcbiAgXG4gIGtleUhhbmRsZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWN0aW9ucyA9IHt9XG4gICAgICAsIG5hbWVcbiAgICBmb3IgKG5hbWUgaW4gdGhpcy5vLmtleWJpbmRpbmdzKSB7XG4gICAgICBhY3Rpb25zW3RoaXMuby5rZXliaW5kaW5nc1tuYW1lXV0gPSB0aGlzLmFjdGlvbnNbbmFtZV1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5leHRyYV9hY3Rpb25zKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gdGhpcy5leHRyYV9hY3Rpb25zKSB7XG4gICAgICAgIGlmICghYWN0aW9uc1tuYW1lXSkge1xuICAgICAgICAgIGFjdGlvbnNbdGhpcy5leHRyYV9hY3Rpb25zW25hbWVdLmJpbmRpbmddID0gdGhpcy5leHRyYV9hY3Rpb25zW25hbWVdLmFjdGlvblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXMoYWN0aW9ucykuYmluZCh0aGlzKVxuICB9LFxuXG5cbiAgZGVmYXVsdF9rZXlzOiB7XG4gICAgJ3VuZG8nOiAnY3RybCt6JyxcbiAgICAncmVkbyc6ICdjdHJsK3NoaWZ0K3onLFxuICAgICdjb2xsYXBzZSc6ICdhbHQrbGVmdCcsXG4gICAgJ3VuY29sbGFwc2UnOiAnYWx0K3JpZ2h0JyxcbiAgICAnZGVkZW50JzogJ3NoaWZ0K3RhYiwgc2hpZnQrYWx0K2xlZnQnLFxuICAgICdpbmRlbnQnOiAndGFiLCBzaGlmdCthbHQrcmlnaHQnLFxuICAgICdtb3ZlIHVwJzogJ3NoaWZ0K2FsdCt1cCcsXG4gICAgJ21vdmUgZG93bic6ICdzaGlmdCthbHQrZG93bicsXG4gICAgJ3VwJzogJ3VwJyxcbiAgICAnZG93bic6ICdkb3duJyxcbiAgICAnbGVmdCc6ICdsZWZ0JyxcbiAgICAncmlnaHQnOiAncmlnaHQnLFxuICAgICdhZGQgYWZ0ZXInOiAncmV0dXJuJyxcbiAgICAnaW5zZXJ0IHJldHVybic6ICdzaGlmdCtyZXR1cm4nLFxuICAgICdtZXJnZSB1cCc6ICdiYWNrc3BhY2UnLFxuICAgICdzdG9wIGVkaXRpbmcnOiAnZXNjYXBlJyxcbiAgfSxcblxuICBhY3Rpb25zOiB7XG4gICAgJ3VuZG8nOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLm8udW5kbygpXG4gICAgfSxcbiAgICAncmVkbyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuby5yZWRvKClcbiAgICB9LFxuICAgICdjb2xsYXBzZSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuby50b2dnbGVDb2xsYXBzZSh0cnVlKVxuICAgIH0sXG4gICAgJ3VuY29sbGFwc2UnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLm8udG9nZ2xlQ29sbGFwc2UoZmFsc2UpXG4gICAgfSxcbiAgICAnZGVkZW50JzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5vLm1vdmVMZWZ0KClcbiAgICB9LFxuICAgICdpbmRlbnQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLm8ubW92ZVJpZ2h0KClcbiAgICB9LFxuICAgICdtb3ZlIHVwJzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5vLm1vdmVVcCgpXG4gICAgfSxcbiAgICAnbW92ZSBkb3duJzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5vLm1vdmVEb3duKClcbiAgICB9LFxuICAgICd1cCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmlzQXRUb3AoKSkge1xuICAgICAgICB0aGlzLm8uZ29VcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgICdkb3duJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuaXNBdEJvdHRvbSgpKSB7XG4gICAgICAgIHRoaXMuby5nb0Rvd24oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgICdsZWZ0JzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuaXNBdFN0YXJ0KCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuby5nb1VwKClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgICAncmlnaHQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5pc0F0RW5kKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuby5nb0Rvd24odHJ1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgICAnaW5zZXJ0IHJldHVybic6IGZ1bmN0aW9uIChlKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG4gICAgJ2FkZCBhZnRlcic6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzcyA9IHRoaXMuZ2V0U2VsZWN0aW9uUG9zaXRpb24oKVxuICAgICAgICAsIG5hbWUgPSB0aGlzLmdldElucHV0VmFsdWUoKVxuICAgICAgICAsIHJlc3QgPSBudWxsXG4gICAgICBpZiAobmFtZS5pbmRleE9mKCdcXG4nKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChzcyA8IG5hbWUubGVuZ3RoKSB7XG4gICAgICAgIHJlc3QgPSBuYW1lLnNsaWNlKHNzKVxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lLnNsaWNlKDAsIHNzKVxuICAgICAgICB0aGlzLnNldElucHV0VmFsdWUodGhpcy5uYW1lKVxuICAgICAgICB0aGlzLnNldFRleHRDb250ZW50KHRoaXMubmFtZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKHRoaXMubmFtZSlcbiAgICAgICAgdGhpcy5zZXRUZXh0Q29udGVudCh0aGlzLm5hbWUpXG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNOZXcpIHRoaXMuby5jaGFuZ2VkKCduYW1lJywgdGhpcy5uYW1lKVxuICAgICAgdGhpcy5vLmFkZEFmdGVyKHJlc3QpXG4gICAgfSxcbiAgICAvLyBvbiBiYWNrc3BhY2VcbiAgICAnbWVyZ2UgdXAnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldElucHV0VmFsdWUoKVxuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vLnJlbW92ZSgpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pc0F0U3RhcnQoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vLnJlbW92ZSh2YWx1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgICAnc3RvcCBlZGl0aW5nJzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zdG9wRWRpdGluZygpO1xuICAgIH1cbiAgfSxcbn1cblxuIiwiXG52YXIgY29tbWFuZHMgPSByZXF1aXJlKCcuL2NvbW1hbmRzJylcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kZWdlclxuXG5mdW5jdGlvbiBtYWtlQ29tbWFuZCh0eXBlLCBhcmdzKSB7XG4gIHZhciBuYW1lcyA9IGNvbW1hbmRzW3R5cGVdLmFyZ3NcbiAgICAsIGRhdGEgPSB7fVxuICBmb3IgKHZhciBpPTA7IGk8bmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICBkYXRhW25hbWVzW2ldXSA9IGFyZ3NbaV1cbiAgfVxuICByZXR1cm4ge3R5cGU6IHR5cGUsIGRhdGE6IGRhdGF9XG59XG5cbmZ1bmN0aW9uIENvbW1hbmRlZ2VyKHZpZXcsIG1vZGVsKSB7XG4gIHRoaXMuY29tbWFuZHMgPSBbXVxuICB0aGlzLmhpc3Rwb3MgPSAwXG4gIHRoaXMudmlldyA9IHZpZXdcbiAgdGhpcy5saXN0ZW5lcnMgPSB7fVxuICB0aGlzLndvcmtpbmcgPSBmYWxzZVxuICB0aGlzLm1vZGVsID0gbW9kZWxcbn1cblxuQ29tbWFuZGVnZXIucHJvdG90eXBlID0ge1xuICAvKipcbiAgICogWW91IGNhbiBwYXNzIGluIGFueSBudW1iZXIgb2YgdHlwZSwgYXJncyBwYWlycy5cbiAgICogRXg6IGV4ZWN1dGVDb21tYW5kcyh0MSwgYTEsIHQyLCBhMiwgLi4uKVxuICAgKi9cbiAgZXhlY3V0ZUNvbW1hbmRzOiBmdW5jdGlvbiAodHlwZSwgYXJncykge1xuICAgIGlmICh0aGlzLndvcmtpbmcpIHJldHVyblxuICAgIHZhciBjbWRzID0gW107XG4gICAgZm9yICh2YXIgaT0wOyBpPGFyZ3VtZW50cy5sZW5ndGg7IGkrPTIpIHtcbiAgICAgIGNtZHMucHVzaChtYWtlQ29tbWFuZChhcmd1bWVudHNbaV0sIGFyZ3VtZW50c1tpKzFdKSlcbiAgICB9XG4gICAgaWYgKHRoaXMuaGlzdHBvcyA+IDApIHtcbiAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzLnNsaWNlKDAsIC10aGlzLmhpc3Rwb3MpXG4gICAgICB0aGlzLmhpc3Rwb3MgPSAwXG4gICAgfVxuICAgIHRoaXMuY29tbWFuZHMucHVzaChjbWRzKVxuICAgIGZvciAodmFyIGk9MDsgaTxjbWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRvQ29tbWFuZChjbWRzW2ldKVxuICAgIH1cbiAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScpXG4gIH0sXG4gIHRyaWdnZXI6IGZ1bmN0aW9uICh3aGF0KSB7XG4gICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzLmxpc3RlbmVyc1t3aGF0XSkge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbd2hhdF1baXRlbV0uYXBwbHkobnVsbCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgIH1cbiAgfSxcbiAgb246IGZ1bmN0aW9uICh3aGF0LCBjYikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbd2hhdF0pIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW3doYXRdID0gW11cbiAgICB9XG4gICAgdGhpcy5saXN0ZW5lcnNbd2hhdF0ucHVzaChjYilcbiAgfSxcbiAgdW5kbzogZnVuY3Rpb24gKCkge1xuICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG4gICAgdmFyIHBvcyA9IHRoaXMuaGlzdHBvcyA/IHRoaXMuaGlzdHBvcyArIDEgOiAxXG4gICAgICAsIGl4ID0gdGhpcy5jb21tYW5kcy5sZW5ndGggLSBwb3NcbiAgICBpZiAoaXggPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2UgLy8gbm8gbW9yZSB1bmRvIVxuICAgIH1cbiAgICB2YXIgY21kcyA9IHRoaXMuY29tbWFuZHNbaXhdXG4gICAgZm9yICh2YXIgaT1jbWRzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcbiAgICAgIHRoaXMudW5kb0NvbW1hbmQoY21kc1tpXSlcbiAgICB9XG4gICAgdGhpcy5oaXN0cG9zICs9IDFcbiAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScpXG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgcmVkbzogZnVuY3Rpb24gKCkge1xuICAgIHZhciBwb3MgPSB0aGlzLmhpc3Rwb3MgPyB0aGlzLmhpc3Rwb3MgLSAxIDogLTFcbiAgICAgICwgaXggPSB0aGlzLmNvbW1hbmRzLmxlbmd0aCAtIDEgLSBwb3NcbiAgICBpZiAoaXggPj0gdGhpcy5jb21tYW5kcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZSAvLyBubyBtb3JlIHRvIHJlZG8hXG4gICAgfVxuICAgIHZhciBjbWRzID0gdGhpcy5jb21tYW5kc1tpeF1cbiAgICBmb3IgKHZhciBpPTA7IGk8Y21kcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5yZWRvQ29tbWFuZChjbWRzW2ldKVxuICAgIH1cbiAgICB0aGlzLmhpc3Rwb3MgLT0gMVxuICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJylcbiAgICByZXR1cm4gdHJ1ZVxuICB9LFxuICBkb0NvbW1hbmQ6IGZ1bmN0aW9uIChjbWQpIHtcbiAgICB0aGlzLndvcmtpbmcgPSB0cnVlXG4gICAgY29tbWFuZHNbY21kLnR5cGVdLmFwcGx5LmNhbGwoY21kLmRhdGEsIHRoaXMudmlldywgdGhpcy5tb2RlbClcbiAgICB0aGlzLndvcmtpbmcgPSBmYWxzZVxuICB9LFxuICB1bmRvQ29tbWFuZDogZnVuY3Rpb24gKGNtZCkge1xuICAgIHRoaXMud29ya2luZyA9IHRydWVcbiAgICBjb21tYW5kc1tjbWQudHlwZV0udW5kby5jYWxsKGNtZC5kYXRhLCB0aGlzLnZpZXcsIHRoaXMubW9kZWwpXG4gICAgdGhpcy53b3JraW5nID0gZmFsc2VcbiAgfSxcbiAgcmVkb0NvbW1hbmQ6IGZ1bmN0aW9uIChjbWQpIHtcbiAgICB0aGlzLndvcmtpbmcgPSB0cnVlXG4gICAgdmFyIGMgPSBjb21tYW5kc1tjbWQudHlwZV1cbiAgICA7KGMucmVkbyB8fCBjLmFwcGx5KS5jYWxsKGNtZC5kYXRhLCB0aGlzLnZpZXcsIHRoaXMubW9kZWwpXG4gICAgdGhpcy53b3JraW5nID0gZmFsc2VcbiAgfSxcbn1cblxuIiwiXG5mdW5jdGlvbiBjb3B5KG9uZSkge1xuICBpZiAoJ29iamVjdCcgIT09IHR5cGVvZiBvbmUpIHJldHVybiBvbmVcbiAgdmFyIHR3byA9IHt9XG4gIGZvciAodmFyIG5hbWUgaW4gb25lKSB7XG4gICAgdHdvW25hbWVdID0gb25lW25hbWVdXG4gIH1cbiAgcmV0dXJuIHR3b1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29sbGFwc2U6IHtcbiAgICBhcmdzOiBbJ2lkJywgJ2RvQ29sbGFwc2UnXSxcbiAgICBhcHBseTogZnVuY3Rpb24gKHZpZXcsIG1vZGVsKSB7XG4gICAgICBtb2RlbC5zZXRDb2xsYXBzZWQodGhpcy5pZCwgdGhpcy5kb0NvbGxhcHNlKVxuICAgICAgdmlldy5zZXRDb2xsYXBzZWQodGhpcy5pZCwgdGhpcy5kb0NvbGxhcHNlKVxuICAgICAgdmlldy5nb1RvKHRoaXMuaWQpXG4gICAgfSxcbiAgICB1bmRvOiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICAgIG1vZGVsLnNldENvbGxhcHNlZCh0aGlzLmlkLCAhdGhpcy5kb0NvbGxhcHNlKVxuICAgICAgdmlldy5zZXRDb2xsYXBzZWQodGhpcy5pZCwgIXRoaXMuZG9Db2xsYXBzZSlcbiAgICAgIHZpZXcuZ29Ubyh0aGlzLmlkKVxuICAgIH0sXG4gIH0sXG4gIG5ld05vZGU6IHtcbiAgICBhcmdzOiBbJ3BpZCcsICdpbmRleCcsICd0ZXh0J10sXG4gICAgYXBwbHk6IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdmFyIGNyID0gbW9kZWwuY3JlYXRlKHRoaXMucGlkLCB0aGlzLmluZGV4LCB0aGlzLnRleHQpXG4gICAgICB0aGlzLmlkID0gY3Iubm9kZS5pZFxuICAgICAgdmlldy5hZGQoY3Iubm9kZSwgY3IuYmVmb3JlKVxuICAgICAgLy8gdmlldy5zdGFydEVkaXRpbmcoY3Iubm9kZS5pZClcbiAgICB9LFxuICAgIHVuZG86IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdmFyIGVkID0gdmlldy5lZGl0aW5nXG4gICAgICB2aWV3LnJlbW92ZSh0aGlzLmlkKVxuICAgICAgdGhpcy5zYXZlZCA9IG1vZGVsLnJlbW92ZSh0aGlzLmlkKVxuICAgICAgdmFyIG5pZCA9IG1vZGVsLmlkc1t0aGlzLnBpZF0uY2hpbGRyZW5bdGhpcy5pbmRleC0xXVxuICAgICAgaWYgKG5pZCA9PT0gdW5kZWZpbmVkKSBuaWQgPSB0aGlzLnBpZFxuICAgICAgaWYgKGVkKSB7XG4gICAgICAgIHZpZXcuc3RhcnRFZGl0aW5nKG5pZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpZXcuc2V0QWN0aXZlKG5pZClcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlZG86IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdmFyIGJlZm9yZSA9IG1vZGVsLnJlYWRkKHRoaXMuc2F2ZWQpXG4gICAgICB2aWV3LmFkZCh0aGlzLnNhdmVkLm5vZGUsIGJlZm9yZSlcbiAgICB9XG4gIH0sXG4gIGFwcGVuZFRleHQ6IHtcbiAgICBhcmdzOiBbJ2lkJywgJ3RleHQnXSxcbiAgICBhcHBseTogZnVuY3Rpb24gKHZpZXcsIG1vZGVsKSB7XG4gICAgICB0aGlzLm9sZHRleHQgPSBtb2RlbC5pZHNbdGhpcy5pZF0uZGF0YS5uYW1lXG4gICAgICBtb2RlbC5hcHBlbmRUZXh0KHRoaXMuaWQsIHRoaXMudGV4dClcbiAgICAgIHZpZXcuYXBwZW5kVGV4dCh0aGlzLmlkLCB0aGlzLnRleHQpXG4gICAgfSxcbiAgICB1bmRvOiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICAgIG1vZGVsLnNldEF0dHIodGhpcy5pZCwgJ25hbWUnLCB0aGlzLm9sZHRleHQpXG4gICAgICB2aWV3LnNldEF0dHIodGhpcy5pZCwgJ25hbWUnLCB0aGlzLm9sZHRleHQpXG4gICAgfVxuICB9LFxuICBjaGFuZ2VOb2RlQXR0cjoge1xuICAgIGFyZ3M6IFsnaWQnLCAnYXR0cicsICd2YWx1ZSddLFxuICAgIGFwcGx5OiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICAgIHRoaXMub2xkdmFsdWUgPSBjb3B5KG1vZGVsLmlkc1t0aGlzLmlkXS5kYXRhW3RoaXMuYXR0cl0pXG4gICAgICBtb2RlbC5zZXRBdHRyKHRoaXMuaWQsIHRoaXMuYXR0ciwgdGhpcy52YWx1ZSlcbiAgICAgIHZpZXcuc2V0QXR0cih0aGlzLmlkLCB0aGlzLmF0dHIsIHRoaXMudmFsdWUpXG4gICAgICB2aWV3LmdvVG8odGhpcy5pZClcbiAgICB9LFxuICAgIHVuZG86IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgbW9kZWwuc2V0QXR0cih0aGlzLmlkLCB0aGlzLmF0dHIsIHRoaXMub2xkdmFsdWUpXG4gICAgICB2aWV3LnNldEF0dHIodGhpcy5pZCwgdGhpcy5hdHRyLCB0aGlzLm9sZHZhbHVlKVxuICAgICAgdmlldy5nb1RvKHRoaXMuaWQpXG4gICAgfVxuICB9LFxuICBjaGFuZ2VOb2RlOiB7XG4gICAgYXJnczogWydpZCcsICduZXdkYXRhJ10sXG4gICAgYXBwbHk6IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdGhpcy5vbGRkYXRhID0gY29weShtb2RlbC5pZHNbdGhpcy5pZF0uZGF0YSlcbiAgICAgIG1vZGVsLnNldERhdGEodGhpcy5pZCwgdGhpcy5uZXdkYXRhKVxuICAgICAgdmlldy5zZXREYXRhKHRoaXMuaWQsIHRoaXMubmV3ZGF0YSlcbiAgICAgIHZpZXcuZ29Ubyh0aGlzLmlkKVxuICAgIH0sXG4gICAgdW5kbzogZnVuY3Rpb24gKHZpZXcsIG1vZGVsKSB7XG4gICAgICBtb2RlbC5zZXREYXRhKHRoaXMuaWQsIHRoaXMub2xkZGF0YSlcbiAgICAgIHZpZXcuc2V0RGF0YSh0aGlzLmlkLCB0aGlzLm9sZGRhdGEpXG4gICAgICB2aWV3LmdvVG8odGhpcy5pZClcbiAgICB9XG4gIH0sXG4gIHJlbW92ZToge1xuICAgIGFyZ3M6IFsnaWQnXSxcbiAgICBhcHBseTogZnVuY3Rpb24gKHZpZXcsIG1vZGVsKSB7XG4gICAgICB2YXIgYmVsb3cgPSBtb2RlbC5uZXh0U2libGluZyh0aGlzLmlkKVxuICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gYmVsb3cpIGJlbG93ID0gbW9kZWwuaWRBYm92ZSh0aGlzLmlkKVxuICAgICAgdmlldy5yZW1vdmUodGhpcy5pZClcbiAgICAgIHRoaXMuc2F2ZWQgPSBtb2RlbC5yZW1vdmUodGhpcy5pZClcbiAgICAgIHZpZXcuc3RhcnRFZGl0aW5nKGJlbG93KVxuICAgIH0sXG4gICAgdW5kbzogZnVuY3Rpb24gKHZpZXcsIG1vZGVsKSB7XG4gICAgICB2YXIgYmVmb3JlID0gbW9kZWwucmVhZGQodGhpcy5zYXZlZClcbiAgICAgIHZpZXcuYWRkVHJlZSh0aGlzLnNhdmVkLm5vZGUsIGJlZm9yZSlcbiAgICB9XG4gIH0sXG4gIGNvcHk6IHtcbiAgICBhcmdzOiBbJ2lkcyddLFxuICAgIGFwcGx5OiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICAgIHZhciBpdGVtcyA9IHRoaXMuaWRzLm1hcChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLmR1bXBEYXRhKGlkLCB0cnVlKVxuICAgICAgfSlcbiAgICAgIG1vZGVsLmNsaXBib2FyZCA9IGl0ZW1zXG4gICAgfSxcbiAgICB1bmRvOiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICB9XG4gIH0sXG4gIGN1dDoge1xuICAgIGFyZ3M6IFsnaWRzJ10sXG4gICAgYXBwbHk6IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdmFyIGl0ZW1zID0gdGhpcy5pZHMubWFwKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB2aWV3LnJlbW92ZShpZClcbiAgICAgICAgcmV0dXJuIG1vZGVsLmR1bXBEYXRhKGlkLCB0cnVlKVxuICAgICAgfSlcbiAgICAgIG1vZGVsLmNsaXBib2FyZCA9IGl0ZW1zXG5cbiAgICAgIHZhciBpZCA9IHRoaXMuaWRzW3RoaXMuaWRzLmxlbmd0aC0xXVxuICAgICAgdmFyIGJlbG93ID0gbW9kZWwubmV4dFNpYmxpbmcoaWQpXG4gICAgICBpZiAodW5kZWZpbmVkID09PSBiZWxvdykgYmVsb3cgPSBtb2RlbC5pZEFib3ZlKHRoaXMuaWRzWzBdKVxuICAgICAgdGhpcy5zYXZlZCA9IHRoaXMuaWRzLm1hcChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlbW92ZShpZClcbiAgICAgIH0pXG5cbiAgICAgIGlmICh2aWV3LmVkaXRpbmcpIHtcbiAgICAgICAgdmlldy5zdGFydEVkaXRpbmcoYmVsb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2aWV3LnNldEFjdGl2ZShiZWxvdylcbiAgICAgIH1cbiAgICB9LFxuICAgIHVuZG86IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdmFyIGJlZm9yZVxuICAgICAgZm9yICh2YXIgaT10aGlzLnNhdmVkLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgYmVmb3JlID0gbW9kZWwucmVhZGQodGhpcy5zYXZlZFtpXSlcbiAgICAgICAgdmlldy5hZGRUcmVlKHRoaXMuc2F2ZWRbaV0ubm9kZSwgYmVmb3JlKVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaWRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdmlldy5zZXRTZWxlY3Rpb24odGhpcy5pZHMpXG4gICAgICAgIHZpZXcuc2V0QWN0aXZlKHRoaXMuaWRzW3RoaXMuaWRzLmxlbmd0aC0xXSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBhc3RlOiB7XG4gICAgYXJnczogWydwaWQnLCAnaW5kZXgnXSxcbiAgICBhcHBseTogZnVuY3Rpb24gKHZpZXcsIG1vZGVsKSB7XG4gICAgICB2YXIgcGlkID0gdGhpcy5waWRcbiAgICAgICAgLCBpbmRleCA9IHRoaXMuaW5kZXhcbiAgICAgICAgLCBlZCA9IHZpZXcuZWRpdGluZ1xuICAgICAgdmFyIGlkcyA9IG1vZGVsLmNsaXBib2FyZC5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIGNyID0gbW9kZWwuY3JlYXRlTm9kZXMocGlkLCBpbmRleCwgaXRlbSlcbiAgICAgICAgdmlldy5hZGRUcmVlKGNyLm5vZGUsIGNyLmJlZm9yZSlcbiAgICAgICAgdmlldy5zZXRDb2xsYXBzZWQoY3Iubm9kZS5wYXJlbnQsIGZhbHNlKVxuICAgICAgICBtb2RlbC5zZXRDb2xsYXBzZWQoY3Iubm9kZS5wYXJlbnQsIGZhbHNlKVxuICAgICAgICBpbmRleCArPSAxXG4gICAgICAgIHJldHVybiBjci5ub2RlLmlkXG4gICAgICB9KVxuICAgICAgdGhpcy5uZXdpZHMgPSBpZHNcbiAgICAgIGlmIChpZHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgaWYgKGVkKSB7XG4gICAgICAgICAgdmlldy5zdGFydEVkaXRpbmcodGhpcy5uZXdpZHNbMF0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmlldy5zZXRBY3RpdmUodGhpcy5uZXdpZHNbMF0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpZXcuc2V0U2VsZWN0aW9uKGlkcylcbiAgICAgICAgdmlldy5zZXRBY3RpdmUoaWRzW2lkcy5sZW5ndGgtMV0pXG4gICAgICB9XG4gICAgfSxcbiAgICB1bmRvOiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICAgIHZhciBpZCA9IHRoaXMubmV3aWRzW3RoaXMubmV3aWRzLmxlbmd0aC0xXVxuICAgICAgdmFyIGJlbG93ID0gbW9kZWwubmV4dFNpYmxpbmcoaWQpXG4gICAgICBpZiAodW5kZWZpbmVkID09PSBiZWxvdykgYmVsb3cgPSBtb2RlbC5pZEFib3ZlKHRoaXMubmV3aWRzWzBdKVxuICAgICAgdGhpcy5zYXZlZCA9IHRoaXMubmV3aWRzLm1hcChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdmlldy5yZW1vdmUoaWQpXG4gICAgICAgIHJldHVybiBtb2RlbC5yZW1vdmUoaWQpXG4gICAgICB9KVxuICAgICAgaWYgKHZpZXcuZWRpdGluZykge1xuICAgICAgICB2aWV3LnN0YXJ0RWRpdGluZyhiZWxvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpZXcuc2V0QWN0aXZlKGJlbG93KVxuICAgICAgfVxuICAgICAgLy8gdmlldy5yZW1vdmUodGhpcy5uZXdpZClcbiAgICAgIC8vIHRoaXMuc2F2ZWQgPSBtb2RlbC5yZW1vdmUodGhpcy5uZXdpZClcbiAgICAgIG1vZGVsLmNsaXBib2FyZCA9IHRoaXMuc2F2ZWRcbiAgICB9LFxuICAgIHJlZG86IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgLy8gdmFyIGJlZm9yZSA9IG1vZGVsLnJlYWRkKHRoaXMuc2F2ZWQpXG4gICAgICAvLyB2aWV3LmFkZFRyZWUodGhpcy5zYXZlZC5ub2RlLCBiZWZvcmUpXG4gICAgICB0aGlzLnNhdmVkLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgYmVmb3JlID0gbW9kZWwucmVhZGQoaXRlbSlcbiAgICAgICAgdmlldy5hZGRUcmVlKGl0ZW0ubm9kZSwgYmVmb3JlKVxuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIG1vdmU6IHtcbiAgICBhcmdzOiBbJ2lkJywgJ3BpZCcsICdpbmRleCddLFxuICAgIGFwcGx5OiBmdW5jdGlvbiAodmlldywgbW9kZWwpIHtcbiAgICAgIHRoaXMub3BpZCA9IG1vZGVsLmlkc1t0aGlzLmlkXS5wYXJlbnRcbiAgICAgIHRoaXMub2luZGV4ID0gbW9kZWwuaWRzW3RoaXMub3BpZF0uY2hpbGRyZW4uaW5kZXhPZih0aGlzLmlkKVxuICAgICAgdmFyIGJlZm9yZSA9IG1vZGVsLm1vdmUodGhpcy5pZCwgdGhpcy5waWQsIHRoaXMuaW5kZXgpXG4gICAgICB2YXIgcGFyZW50ID0gbW9kZWwuaWRzW3RoaXMub3BpZF1cbiAgICAgICAgLCBsYXN0Y2hpbGQgPSBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAwXG4gICAgICB2aWV3Lm1vdmUodGhpcy5pZCwgdGhpcy5waWQsIGJlZm9yZSwgdGhpcy5vcGlkLCBsYXN0Y2hpbGQpXG4gICAgICB2aWV3LmdvVG8odGhpcy5pZClcbiAgICB9LFxuICAgIHVuZG86IGZ1bmN0aW9uICh2aWV3LCBtb2RlbCkge1xuICAgICAgdmFyIGJlZm9yZSA9IG1vZGVsLm1vdmUodGhpcy5pZCwgdGhpcy5vcGlkLCB0aGlzLm9pbmRleClcbiAgICAgICAgLCBsYXN0Y2hpbGQgPSBtb2RlbC5pZHNbdGhpcy5waWRdLmNoaWxkcmVuLmxlbmd0aCA9PT0gMFxuICAgICAgdmlldy5tb3ZlKHRoaXMuaWQsIHRoaXMub3BpZCwgYmVmb3JlLCB0aGlzLnBpZCwgbGFzdGNoaWxkKVxuICAgICAgdmlldy5nb1RvKHRoaXMuaWQpXG4gICAgfVxuICB9XG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyXG5cbnZhciBWaWV3ID0gcmVxdWlyZSgnLi92aWV3JylcbiAgLCBDb21tYW5kZWdlciA9IHJlcXVpcmUoJy4vY29tbWFuZGVnZXInKVxuICAsIERlZmF1bHROb2RlID0gcmVxdWlyZSgnLi9kZWZhdWx0LW5vZGUnKVxuICAsIFZpZXcgPSByZXF1aXJlKCcuL3ZpZXcnKVxuXG4gICwgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbmZ1bmN0aW9uIENvbnRyb2xsZXIobW9kZWwsIG8pIHtcbiAgbyA9IG8gfHwge3ZpZXdPcHRpb25zOiB7fX1cbiAgdGhpcy5vID0gdXRpbC5leHRlbmQoe1xuICAgIFZpZXc6IFZpZXcsXG4gIH0sIG8pXG4gIHRoaXMuby52aWV3T3B0aW9ucyA9IHV0aWwuZXh0ZW5kKHtcbiAgICBub2RlOiBEZWZhdWx0Tm9kZVxuICB9LCBvLnZpZXdPcHRpb25zKVxuICB0aGlzLm1vZGVsID0gbW9kZWxcbiAgdGhpcy52aWV3ID0gbmV3IHRoaXMuby5WaWV3KFxuICAgIHRoaXMuYmluZEFjdGlvbnMuYmluZCh0aGlzKSxcbiAgICB0aGlzLm1vZGVsLCB0aGlzLFxuICAgIHRoaXMuby52aWV3T3B0aW9uc1xuICApXG4gIHRoaXMubm9kZSA9IHRoaXMudmlldy5pbml0aWFsaXplKG1vZGVsLnJvb3QpXG4gIHRoaXMuY21kID0gbmV3IENvbW1hbmRlZ2VyKHRoaXMudmlldywgdGhpcy5tb2RlbClcblxuICB2YXIgYWN0aW9ucyA9IHt9XG4gIGZvciAodmFyIG5hbWUgaW4gdGhpcy5hY3Rpb25zKSB7XG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgdGhpcy5hY3Rpb25zW25hbWVdKSBhY3Rpb25zW25hbWVdID0gdGhpcy5hY3Rpb25zW25hbWVdXG4gICAgZWxzZSBhY3Rpb25zW25hbWVdID0gdGhpcy5hY3Rpb25zW25hbWVdLmJpbmQodGhpcylcbiAgfVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zXG4gIHRoaXMubGlzdGVuZXJzID0ge31cbiAgLy8gY29ubmVjdCB0aGUgdHdvLlxufVxuXG5Db250cm9sbGVyLnByb3RvdHlwZSA9IHtcbiAgdW5kbzogZnVuY3Rpb24gKCkge3RoaXMuY21kLnVuZG8oKX0sXG4gIHJlZG86IGZ1bmN0aW9uICgpIHt0aGlzLmNtZC5yZWRvKCl9LFxuICBvbjogZnVuY3Rpb24gKGV2dCwgZnVuYykge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZ0XSkge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbZXZ0XSA9IFtdXG4gICAgfVxuICAgIHRoaXMubGlzdGVuZXJzW2V2dF0ucHVzaChmdW5jKVxuICB9LFxuICB0cmlnZ2VyOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldnRdKSByZXR1cm5cbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLmxpc3RlbmVyc1tldnRdLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tldnRdW2ldLmFwcGx5KG51bGwsIGFyZ3MpXG4gICAgfVxuICB9LFxuXG4gIGJpbmRBY3Rpb25zOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgYWN0aW9ucyA9IHt9XG4gICAgICAsIHZhbFxuICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLmFjdGlvbnMpIHtcbiAgICAgIHZhbCA9IHRoaXMuYWN0aW9uc1thY3Rpb25dXG4gICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiB2YWwpIHtcbiAgICAgICAgdmFsID0gdGhpc1t2YWxdW2FjdGlvbl0uYmluZCh0aGlzW3ZhbF0sIGlkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gdmFsLmJpbmQodGhpcywgaWQpXG4gICAgICB9XG4gICAgICBhY3Rpb25zW2FjdGlvbl0gPSB2YWxcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbnNcbiAgfSxcblxuICBleGVjdXRlQ29tbWFuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNtZC5leGVjdXRlQ29tbWFuZHMuYXBwbHkodGhpcy5jbWQsIGFyZ3VtZW50cylcbiAgfSxcblxuICAvLyBwdWJsaWNcbiAgc2V0Q29sbGFwc2VkOiBmdW5jdGlvbiAoaWQsIGRvQ29sbGFwc2UpIHtcbiAgICBpZiAoIXRoaXMubW9kZWwuaGFzQ2hpbGRyZW4oaWQpKSByZXR1cm5cbiAgICBpZiAodGhpcy5tb2RlbC5pc0NvbGxhcHNlZChpZCkgPT09IGRvQ29sbGFwc2UpIHJldHVyblxuICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdjb2xsYXBzZScsIFtpZCwgZG9Db2xsYXBzZV0pO1xuICB9LFxuICBhZGRCZWZvcmU6IGZ1bmN0aW9uIChpZCwgdGV4dCkge1xuICAgIHZhciBudyA9IHRoaXMubW9kZWwuaWROZXcoaWQsIHRydWUpXG4gICAgdGhpcy5leGVjdXRlQ29tbWFuZHMoJ25ld05vZGUnLCBbbncucGlkLCBudy5pbmRleCwgdGV4dF0pXG4gIH0sXG5cbiAgYWN0aW9uczoge1xuICAgIHRyaWdnZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudHJpZ2dlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfSxcbiAgICBnb1VwOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgaWYgKGlkID09PSAnbmV3JykgcmV0dXJuIHRoaXMudmlldy5nb1RvKHRoaXMudmlldy5yb290KVxuICAgICAgLy8gc2hvdWxkIEkgY2hlY2sgdG8gc2VlIGlmIGl0J3Mgb2s/XG4gICAgICB2YXIgYWJvdmUgPSB0aGlzLm1vZGVsLmlkQWJvdmUoaWQpXG4gICAgICBpZiAoYWJvdmUgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgICB0aGlzLnZpZXcuc3RhcnRFZGl0aW5nKGFib3ZlKTtcbiAgICB9LFxuICAgIGdvRG93bjogZnVuY3Rpb24gKGlkLCBmcm9tU3RhcnQpIHtcbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVybiB0aGlzLnZpZXcuZ29Ubyh0aGlzLnZpZXcucm9vdClcbiAgICAgIHZhciBiZWxvdyA9IHRoaXMubW9kZWwuaWRCZWxvdyhpZCwgdGhpcy52aWV3LnJvb3QpXG4gICAgICBpZiAoYmVsb3cgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgICB0aGlzLnZpZXcuc3RhcnRFZGl0aW5nKGJlbG93LCBmcm9tU3RhcnQpO1xuICAgIH0sXG4gICAgZ29MZWZ0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVybiB0aGlzLnZpZXcuZ29Ubyh0aGlzLnZpZXcucm9vdClcbiAgICAgIGlmIChpZCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgdmFyIHBhcmVudCA9IHRoaXMubW9kZWwuZ2V0UGFyZW50KGlkKVxuICAgICAgaWYgKCFwYXJlbnQpIHJldHVyblxuICAgICAgdGhpcy52aWV3LnN0YXJ0RWRpdGluZyhwYXJlbnQpXG4gICAgfSxcbiAgICBnb1JpZ2h0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVybiB0aGlzLnZpZXcuZ29Ubyh0aGlzLnZpZXcucm9vdClcbiAgICAgIHZhciBjaGlsZCA9IHRoaXMubW9kZWwuZ2V0Q2hpbGQoaWQpXG4gICAgICBpZiAoIWNoaWxkKSByZXR1cm5cbiAgICAgIHRoaXMudmlldy5zdGFydEVkaXRpbmcoY2hpbGQpXG4gICAgfSxcbiAgICBzdGFydE1vdmluZzogZnVuY3Rpb24gKGlkKSB7XG4gICAgICBpZiAoaWQgPT09ICduZXcnKSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgdGhpcy52aWV3LnN0YXJ0TW92aW5nKGlkKVxuICAgIH0sXG5cbiAgICAvLyBtb2RpZmljYXRpb25cbiAgICB1bmRvOiBmdW5jdGlvbiAoKSB7dGhpcy5jbWQudW5kbygpfSxcbiAgICByZWRvOiBmdW5jdGlvbiAoKSB7dGhpcy5jbWQucmVkbygpfSxcblxuICAgIC8vIGNvbW1hbmRlcnNcbiAgICBjdXQ6IGZ1bmN0aW9uIChpZHMpIHtcbiAgICAgIGlmIChpZHMgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShpZHMpKSB7XG4gICAgICAgIGlkcyA9IFtpZHNdXG4gICAgICB9XG4gICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kcygnY3V0JywgW2lkc10pXG4gICAgfSxcbiAgICBjb3B5OiBmdW5jdGlvbiAoaWRzKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaWRzKSkge1xuICAgICAgICBpZHMgPSBbaWRzXVxuICAgICAgfVxuICAgICAgdGhpcy5leGVjdXRlQ29tbWFuZHMoJ2NvcHknLCBbaWRzXSlcbiAgICB9LFxuXG4gICAgcGFzdGU6IGZ1bmN0aW9uIChpZCwgYWJvdmUpIHtcbiAgICAgIGlmICghdGhpcy5tb2RlbC5jbGlwYm9hcmQpIHJldHVyblxuICAgICAgdmFyIG53ID0gdGhpcy5tb2RlbC5pZE5ldyhpZCwgYWJvdmUpXG4gICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kcygncGFzdGUnLCBbbncucGlkLCBudy5pbmRleF0pXG4gICAgfSxcbiAgICBjaGFuZ2VkOiBmdW5jdGlvbiAoaWQsIGF0dHIsIHZhbHVlKSB7XG4gICAgICBpZiAoaWQgPT09ICduZXcnKSB7XG4gICAgICAgIGlmICghdmFsdWUpIHJldHVyblxuICAgICAgICB2YXIgbncgPSB0aGlzLnZpZXcucmVtb3ZlTmV3KClcbiAgICAgICAgdGhpcy5leGVjdXRlQ29tbWFuZHMoJ25ld05vZGUnLCBbbncucGlkLCBudy5pbmRleCwgdmFsdWVdKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdjaGFuZ2VOb2RlQXR0cicsIFtpZCwgYXR0ciwgdmFsdWVdKVxuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24gKHdoZXJlLCBpZCwgdGFyZ2V0KSB7XG4gICAgICB2YXIgYWN0aW9uID0ge1xuICAgICAgICBiZWZvcmU6ICdUb0JlZm9yZScsXG4gICAgICAgIGFmdGVyOiAnVG9BZnRlcicsXG4gICAgICAgIGNoaWxkOiAnSW50bydcbiAgICAgIH1bd2hlcmVdXG4gICAgICB0aGlzLmFjdGlvbnNbJ21vdmUnICsgYWN0aW9uXShpZCwgdGFyZ2V0KS8vdGFyZ2V0LCBpZClcbiAgICB9LFxuICAgIG1vdmVUb0JlZm9yZTogZnVuY3Rpb24gKGlkLCBzaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgaWYgKGlkID09PSAnbmV3JykgcmV0dXJuXG4gICAgICB2YXIgcGxhY2UgPSB0aGlzLm1vZGVsLm1vdmVCZWZvcmVQbGFjZShzaWQsIGlkKVxuICAgICAgaWYgKCFwbGFjZSkgcmV0dXJuXG4gICAgICAvLyBpZiAodGhpcy5tb2RlbC5zYW1lUGxhY2UoaWQsIHBsYWNlKSkgcmV0dXJuXG4gICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kcygnbW92ZScsIFtpZCwgcGxhY2UucGlkLCBwbGFjZS5peF0pXG4gICAgfSxcbiAgICBtb3ZlVG9BZnRlcjogZnVuY3Rpb24gKGlkLCBzaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgaWYgKGlkID09PSAnbmV3JykgcmV0dXJuXG4gICAgICB2YXIgcGxhY2UgPSB0aGlzLm1vZGVsLm1vdmVBZnRlclBsYWNlKHNpZCwgaWQpXG4gICAgICBpZiAoIXBsYWNlKSByZXR1cm5cbiAgICAgIC8vIGlmICh0aGlzLm1vZGVsLnNhbWVQbGFjZShpZCwgcGxhY2UpKSByZXR1cm5cbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdtb3ZlJywgW2lkLCBwbGFjZS5waWQsIHBsYWNlLml4XSlcbiAgICB9LFxuICAgIG1vdmVJbnRvOiBmdW5jdGlvbiAoaWQsIHBpZCkge1xuICAgICAgaWYgKGlkID09PSB0aGlzLnZpZXcucm9vdCkgcmV0dXJuXG4gICAgICBpZiAoaWQgPT09ICduZXcnKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLm1vZGVsLnNhbWVQbGFjZShpZCwge3BpZDogcGlkLCBpeDogMH0pKSByZXR1cm5cbiAgICAgIGlmICghdGhpcy5tb2RlbC5pc0NvbGxhcHNlZChwaWQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGVDb21tYW5kcygnbW92ZScsIFtpZCwgcGlkLCAwXSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdjb2xsYXBzZScsIFtwaWQsIGZhbHNlXSwgJ21vdmUnLCBbaWQsIHBpZCwgMF0pXG4gICAgfSxcbiAgICBtb3ZlUmlnaHQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgaWYgKGlkID09PSB0aGlzLnZpZXcucm9vdCkgcmV0dXJuXG4gICAgICBpZiAoaWQgPT09ICduZXcnKSByZXR1cm5cbiAgICAgIHZhciBzaWIgPSB0aGlzLm1vZGVsLnByZXZTaWJsaW5nKGlkLCB0cnVlKVxuICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gc2liKSByZXR1cm5cbiAgICAgIGlmICghdGhpcy5tb2RlbC5pc0NvbGxhcHNlZChzaWIpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGVDb21tYW5kcygnbW92ZScsIFtpZCwgc2liLCBmYWxzZV0pXG4gICAgICB9XG4gICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kcygnY29sbGFwc2UnLCBbc2liLCBmYWxzZV0sICdtb3ZlJywgW2lkLCBzaWIsIGZhbHNlXSlcbiAgICB9LFxuICAgIG1vdmVMZWZ0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgaWYgKGlkID09PSAnbmV3JykgcmV0dXJuXG4gICAgICBpZiAodGhpcy5tb2RlbC5pZHNbaWRdLnBhcmVudCA9PT0gdGhpcy52aWV3LnJvb3QpIHJldHVyblxuICAgICAgLy8gVE9ETyBoYW5kbGUgbXVsdGlwbGUgc2VsZWN0ZWRcbiAgICAgIHZhciBwbGFjZSA9IHRoaXMubW9kZWwuc2hpZnRMZWZ0UGxhY2UoaWQpXG4gICAgICBpZiAoIXBsYWNlKSByZXR1cm5cbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdtb3ZlJywgW2lkLCBwbGFjZS5waWQsIHBsYWNlLml4XSlcbiAgICB9LFxuICAgIG1vdmVVcDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgICAgLy8gVE9ETyBoYW5kbGUgbXVsdGlwbGUgc2VsZWN0ZWRcbiAgICAgIHZhciBwbGFjZSA9IHRoaXMubW9kZWwuc2hpZnRVcFBsYWNlKGlkKVxuICAgICAgaWYgKCFwbGFjZSkgcmV0dXJuXG4gICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kcygnbW92ZScsIFtpZCwgcGxhY2UucGlkLCBwbGFjZS5peF0pXG4gICAgfSxcbiAgICBtb3ZlRG93bjogZnVuY3Rpb24gKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgICAgLy8gVE9ETyBoYW5kbGUgbXVsdGlwbGUgc2VsZWN0ZWRcbiAgICAgIHZhciBwbGFjZSA9IHRoaXMubW9kZWwuc2hpZnREb3duUGxhY2UoaWQpXG4gICAgICBpZiAoIXBsYWNlKSByZXR1cm5cbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdtb3ZlJywgW2lkLCBwbGFjZS5waWQsIHBsYWNlLml4XSlcbiAgICB9LFxuICAgIG1vdmVUb1RvcDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgICAgdmFyIGZpcnN0ID0gdGhpcy5tb2RlbC5maXJzdFNpYmxpbmcoaWQpXG4gICAgICBpZiAodW5kZWZpbmVkID09PSBmaXJzdCkgcmV0dXJuXG4gICAgICB2YXIgcGlkID0gdGhpcy5tb2RlbC5pZHNbZmlyc3RdLnBhcmVudFxuICAgICAgaWYgKHBpZCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICAgIHZhciBpeCA9IHRoaXMubW9kZWwuaWRzW3BpZF0uY2hpbGRyZW4uaW5kZXhPZihmaXJzdClcbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdtb3ZlJywgW2lkLCBwaWQsIGl4XSlcbiAgICB9LFxuICAgIG1vdmVUb0JvdHRvbTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgICAgdmFyIGxhc3QgPSB0aGlzLm1vZGVsLmxhc3RTaWJsaW5nKGlkKVxuICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gbGFzdCkgcmV0dXJuXG4gICAgICB2YXIgcGlkID0gdGhpcy5tb2RlbC5pZHNbbGFzdF0ucGFyZW50XG4gICAgICBpZiAocGlkID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgdmFyIGl4ID0gdGhpcy5tb2RlbC5pZHNbcGlkXS5jaGlsZHJlbi5pbmRleE9mKGxhc3QpXG4gICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kcygnbW92ZScsIFtpZCwgcGlkLCBpeCArIDFdKVxuICAgIH0sXG4gICAgdG9nZ2xlQ29sbGFwc2U6IGZ1bmN0aW9uIChpZCwgeWVzKSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgeWVzID0gIXRoaXMubW9kZWwuaWRzW2lkXS5jaGlsZHJlbi5sZW5ndGggfHwgIXRoaXMubW9kZWwuaXNDb2xsYXBzZWQoaWQpXG4gICAgICB9XG4gICAgICBpZiAoeWVzKSB7XG4gICAgICAgIGlkID0gdGhpcy5tb2RlbC5maW5kQ29sbGFwc2VyKGlkKVxuICAgICAgICBpZiAoIXRoaXMubW9kZWwuaGFzQ2hpbGRyZW4oaWQpIHx8IHRoaXMubW9kZWwuaXNDb2xsYXBzZWQoaWQpKSByZXR1cm5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5tb2RlbC5oYXNDaGlsZHJlbihpZCkgfHwgIXRoaXMubW9kZWwuaXNDb2xsYXBzZWQoaWQpKSByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCdjb2xsYXBzZScsIFtpZCwgeWVzXSlcbiAgICB9LFxuICAgIGFkZEJlZm9yZTogZnVuY3Rpb24gKGlkLCB0ZXh0KSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHtcbiAgICAgICAgLy8gVE9ETzogYmV0dGVyIGJlaGF2aW9yIGhlcmVcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB2YXIgbncgPSB0aGlzLm1vZGVsLmlkTmV3KGlkLCB0cnVlKVxuICAgICAgdGhpcy5leGVjdXRlQ29tbWFuZHMoJ25ld05vZGUnLCBbbncucGlkLCBudy5pbmRleCwgdGV4dF0pXG4gICAgfSxcbiAgICBhZGRBZnRlcjogZnVuY3Rpb24gKGlkLCB0ZXh0KSB7XG4gICAgICBpZiAoaWQgPT09ICduZXcnKSB7XG4gICAgICAgIC8vIFRPRE86IGJldHRlciBiZWhhdmlvciBoZXJlXG5cbiAgICAgICAgdmFyIG53ID0gdGhpcy52aWV3LnJlbW92ZU5ldygpXG4gICAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKFxuICAgICAgICAgICduZXdOb2RlJywgW253LnBpZCwgbncuaW5kZXgrMSwgJyddXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSB7XG4gICAgICAgIGlmICh0aGlzLnZpZXcubmV3Tm9kZSkgcmV0dXJuIHRoaXMudmlldy5zdGFydEVkaXRpbmcoJ25ldycpXG4gICAgICAgIHRoaXMudmlldy5hZGROZXcoaWQsIDApXG4gICAgICAgIHRoaXMudmlldy5zdGFydEVkaXRpbmcoJ25ldycpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmFyIG53ID0gdGhpcy5tb2RlbC5pZE5ldyhpZCwgZmFsc2UsIHRoaXMudmlldy5yb290KVxuICAgICAgICAsIGVkID0gdGhpcy52aWV3LmVkaXRpbmdcbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKCduZXdOb2RlJywgW253LnBpZCwgbncuaW5kZXgsIHRleHRdKVxuICAgICAgaWYgKGVkKSB0aGlzLnZpZXcuc3RhcnRFZGl0aW5nKClcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKGlkLCBhZGRUZXh0KSB7XG4gICAgICBpZiAoaWQgPT09IHRoaXMudmlldy5yb290KSByZXR1cm5cbiAgICAgIGlmIChpZCA9PT0gJ25ldycpIHJldHVyblxuICAgICAgdmFyIGJlZm9yZSA9IHRoaXMubW9kZWwuaWRBYm92ZShpZClcbiAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmRzKFxuICAgICAgICAncmVtb3ZlJywgW2lkXSxcbiAgICAgICAgJ2FwcGVuZFRleHQnLCBbYmVmb3JlLCBhZGRUZXh0IHx8ICcnXVxuICAgICAgKVxuICAgIH0sXG4gICAgc2V0RWRpdGluZzogJ3ZpZXcnLFxuICAgIGRvbmVFZGl0aW5nOiAndmlldydcbiAgfVxufVxuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdE5vZGVcblxudmFyIEJhc2VOb2RlID0gcmVxdWlyZSgnLi9iYXNlLW5vZGUnKVxuXG5tYXJrZWQuc2V0T3B0aW9ucyh7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IHRydWUsXG4gIHBlZGFudGljOiBmYWxzZSxcbiAgc2FuaXRpemU6IGZhbHNlLFxuICBzbWFydExpc3RzOiB0cnVlLFxuICBzbWFydHlwYW50czogdHJ1ZVxufSlcblxuZnVuY3Rpb24gRGVmYXVsdE5vZGUoZGF0YSwgb3B0aW9ucywgaXNOZXcpIHtcbiAgQmFzZU5vZGUuY2FsbCh0aGlzLCBkYXRhLCBvcHRpb25zLCBpc05ldylcbn1cblxuRGVmYXVsdE5vZGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTm9kZS5wcm90b3R5cGUpXG5EZWZhdWx0Tm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEZWZhdWx0Tm9kZVxuLy8gbWVyZ2UoRGVmYXVsdE5vZGUsIEJhc2VOb2RlKVxuXG5mdW5jdGlvbiB0bWVyZ2UoYSwgYikge1xuICBmb3IgKHZhciBjIGluIGIpIHtcbiAgICBhW2NdID0gYltjXVxuICB9XG59XG5cbnRtZXJnZShEZWZhdWx0Tm9kZS5wcm90b3R5cGUsIHtcbiAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGh0bWwgPSB2YWx1ZS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgdGhpcy5pbnB1dC5pbm5lckhUTUwgPSBodG1sO1xuICB9LFxuICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQuaW5uZXJIVE1MXG4gICAgICAgICAgICAucmVwbGFjZSgvPGRpdj4vZywgJ1xcbicpLnJlcGxhY2UoLzxicj4vZywgJ1xcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcL2Rpdj4vZywgJycpLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZndDsvZywgJz4nKS5yZXBsYWNlKC9cXHUyMDBiL2csICcnKVxuICB9LFxuICBzZXRUZXh0Q29udGVudDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy50ZXh0LmlubmVySFRNTCA9IG1hcmtlZCh2YWx1ZSlcbiAgfSxcbiAgc2V0dXBOb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJywgdHJ1ZSlcbiAgICB0aGlzLmlucHV0LmNsYXNzTGlzdC5hZGQoJ2xpc3RsZXNzX19pbnB1dCcpXG4gICAgdGhpcy50ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnRleHQuY2xhc3NMaXN0LmFkZCgnbGlzdGxlc3NfX3RleHQnKVxuICAgIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19fZGVmYXVsdC1ub2RlJylcblxuICAgIHRoaXMuc2V0VGV4dENvbnRlbnQodGhpcy5uYW1lKVxuICAgIHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLnRleHQpXG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICB9LFxuICBpc0F0VG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJiID0gdGhpcy5pbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgLCBzZWxyID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCkuZ2V0Q2xpZW50UmVjdHMoKVswXVxuICAgIHJldHVybiBzZWxyLnRvcCA8IGJiLnRvcCArIDVcbiAgfSxcbiAgaXNBdEJvdHRvbTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBiYiA9IHRoaXMuaW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICwgc2VsciA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApLmdldENsaWVudFJlY3RzKClbMF1cbiAgICByZXR1cm4gc2Vsci5ib3R0b20gPiBiYi5ib3R0b20gLSA1XG4gIH0sXG4gIGdldFNlbGVjdGlvblBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgICAgLCByYW4gPSBzZWwuZ2V0UmFuZ2VBdCgwKVxuICAgIHJldHVybiByYW4uc3RhcnRPZmZzZXRcbiAgfSxcbiAgc3RhcnRFZGl0aW5nOiBmdW5jdGlvbiAoZnJvbVN0YXJ0KSB7XG4gICAgaWYgKHRoaXMuZWRpdGluZykgcmV0dXJuXG4gICAgdGhpcy5lZGl0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNldElucHV0VmFsdWUodGhpcy5uYW1lKVxuICAgIHRoaXMubm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5pbnB1dCwgdGhpcy50ZXh0KVxuICAgIHRoaXMuaW5wdXQuZm9jdXMoKTtcbiAgICB0aGlzLnNldFNlbGVjdGlvbighZnJvbVN0YXJ0KVxuICAgIHRoaXMuby5zZXRFZGl0aW5nKClcbiAgfSxcbiAgc3RvcEVkaXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZWRpdGluZykgcmV0dXJuXG4gICAgY29uc29sZS5sb2coJ3N0b3AgZWRkaW50JywgdGhpcy5pc05ldylcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldElucHV0VmFsdWUoKVxuICAgIHRoaXMuZWRpdGluZyA9IGZhbHNlXG4gICAgdGhpcy5ub2RlLnJlcGxhY2VDaGlsZCh0aGlzLnRleHQsIHRoaXMuaW5wdXQpXG4gICAgdGhpcy5vLmRvbmVFZGl0aW5nKCk7XG4gICAgaWYgKHRoaXMubmFtZSAhPSB2YWx1ZSB8fCB0aGlzLmlzTmV3KSB7XG4gICAgICB0aGlzLnNldFRleHRDb250ZW50KHZhbHVlKVxuICAgICAgdGhpcy5uYW1lID0gdmFsdWVcbiAgICAgIHRoaXMuby5jaGFuZ2VkKCduYW1lJywgdGhpcy5uYW1lKVxuICAgIH1cbiAgfSxcblxuICBpc0F0U3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWxlY3Rpb25Qb3NpdGlvbigpID09PSAwXG4gIH0sXG5cbiAgaXNBdEVuZDogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUud2FybihcIlRISVMgSVMgV1JPTkdcIilcbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcbiAgYWRkRWRpdFRleHQ6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgdmFyIHBsID0gdGhpcy5uYW1lLmxlbmd0aFxuICAgIHRoaXMubmFtZSArPSB0ZXh0XG4gICAgdGhpcy5zZXRJbnB1dFZhbHVlKHRoaXMubmFtZSlcbiAgICB0aGlzLnNldFRleHRDb250ZW50KHRoaXMubmFtZSlcbiAgICBpZiAoIXRoaXMuZWRpdGluZykge1xuICAgICAgdGhpcy5lZGl0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5pbnB1dCwgdGhpcy50ZXh0KVxuICAgICAgdGhpcy5vLnNldEVkaXRpbmcoKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTZWxlY3Rpb24ocGwpXG4gIH0sXG4gIHNldEF0dHI6IGZ1bmN0aW9uIChhdHRyLCB2YWx1ZSkge1xuICAgIGlmIChhdHRyID09PSAnbmFtZScpIHtcbiAgICAgIHRoaXMubmFtZSA9IHZhbHVlXG4gICAgICB0aGlzLnNldElucHV0VmFsdWUodmFsdWUpXG4gICAgICB0aGlzLnNldFRleHRDb250ZW50KHZhbHVlKVxuICAgIH1cbiAgfSxcblxuICByZWdpc3Rlckxpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudGV4dC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgdGhpcy5zdGFydEVkaXRpbmcoKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHRoaXMuc3RvcEVkaXRpbmcoKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICBcbiAgICB2YXIga2V5SGFuZGxlciA9IHRoaXMua2V5SGFuZGxlcigpXG5cbiAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgcmV0dXJuIGtleUhhbmRsZXIoZSlcbiAgICB9KVxuXG4gIH0sXG4gIHNldFNlbGVjdGlvbjogZnVuY3Rpb24gKGVuZCkge1xuICAgIHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBzZWwuc2VsZWN0QWxsQ2hpbGRyZW4odGhpcy5pbnB1dClcbiAgICB0cnkge1xuICAgICAgc2VsWydjb2xsYXBzZVRvJyArIChlbmQgPyAnRW5kJyA6ICdTdGFydCcpXSgpXG4gICAgfSBjYXRjaCAoZSkge31cbiAgfSxcblxufSlcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IER1bmdlb25zQW5kRHJhZ29uc1xuXG5mdW5jdGlvbiBmaW5kVGFyZ2V0KHRhcmdldHMsIGUpIHtcbiAgZm9yICh2YXIgaT0wOyBpPHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGFyZ2V0c1tpXS50b3AgPiBlLmNsaWVudFkpIHtcbiAgICAgIHJldHVybiB0YXJnZXRzW2kgPiAwID8gaS0xIDogMF1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldHNbdGFyZ2V0cy5sZW5ndGgtMV1cbn1cblxuLy8gTWFuYWdlcyBEcmFnZ2luZyBOIERyb3BwaW5nXG5mdW5jdGlvbiBEdW5nZW9uc0FuZERyYWdvbnModmwsIGFjdGlvbikge1xuICB0aGlzLnZsID0gdmxcbiAgdGhpcy5hY3Rpb24gPSBhY3Rpb25cbn1cblxuRHVuZ2VvbnNBbmREcmFnb25zLnByb3RvdHlwZSA9IHtcbiAgc3RhcnRNb3Zpbmc6IGZ1bmN0aW9uICh0YXJnZXRzLCBpZCkge1xuICAgIHRoaXMubW92aW5nID0ge1xuICAgICAgdGFyZ2V0czogdGFyZ2V0cyxcbiAgICAgIHNoYWRvdzogdGhpcy52bC5tYWtlRHJvcFNoYWRvdygpLFxuICAgICAgY3VycmVudDogbnVsbFxuICAgIH1cbiAgICB0aGlzLnZsLnNldE1vdmluZyhpZCwgdHJ1ZSlcbiAgICB2YXIgb25Nb3ZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHRoaXMuZHJhZyhpZCwgZSlcbiAgICB9LmJpbmQodGhpcylcbiAgICB2YXIgb25VcCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICcnXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdmUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25VcClcbiAgICAgIHRoaXMuZHJvcChpZCwgZSlcbiAgICB9LmJpbmQodGhpcylcblxuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ21vdmUnXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3ZlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvblVwKVxuICB9LFxuICBkcmFnOiBmdW5jdGlvbiAoaWQsIGUpIHtcbiAgICBpZiAodGhpcy5tb3ZpbmcuY3VycmVudCkge1xuICAgICAgdGhpcy52bC5zZXREcm9wcGluZyh0aGlzLm1vdmluZy5jdXJyZW50LmlkLCBmYWxzZSwgdGhpcy5tb3ZpbmcuY3VycmVudC5wbGFjZSA9PT0gJ2NoaWxkJylcbiAgICB9XG4gICAgdmFyIHRhcmdldCA9IGZpbmRUYXJnZXQodGhpcy5tb3ZpbmcudGFyZ2V0cywgZSlcbiAgICB0aGlzLm1vdmluZy5zaGFkb3cubW92ZVRvKHRhcmdldClcbiAgICB0aGlzLm1vdmluZy5jdXJyZW50ID0gdGFyZ2V0XG4gICAgdGhpcy52bC5zZXREcm9wcGluZyh0YXJnZXQuaWQsIHRydWUsIHRoaXMubW92aW5nLmN1cnJlbnQucGxhY2UgPT09ICdjaGlsZCcpXG4gIH0sXG4gIGRyb3A6IGZ1bmN0aW9uIChpZCwgZSkge1xuICAgIHRoaXMubW92aW5nLnNoYWRvdy5yZW1vdmUoKVxuICAgIHZhciBjdXJyZW50ID0gdGhpcy5tb3ZpbmcuY3VycmVudFxuICAgIHRoaXMudmwuc2V0TW92aW5nKGlkLCBmYWxzZSlcbiAgICBpZiAoIXRoaXMubW92aW5nLmN1cnJlbnQpIHJldHVyblxuICAgIHRoaXMudmwuc2V0RHJvcHBpbmcoY3VycmVudC5pZCwgZmFsc2UsIGN1cnJlbnQucGxhY2UgPT09ICdjaGlsZCcpXG4gICAgaWYgKGN1cnJlbnQuaWQgPT09IGlkKSByZXR1cm5cbiAgICB0aGlzLmFjdGlvbihjdXJyZW50LnBsYWNlLCBpZCwgY3VycmVudC5pZClcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlXG4gIH0sXG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBEb21WaWV3TGF5ZXJcblxuZnVuY3Rpb24gZW5zdXJlSW5WaWV3KGl0ZW0pIHtcbiAgdmFyIGJiID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBpZiAoYmIudG9wIDwgMCkgcmV0dXJuIGl0ZW0uc2Nyb2xsSW50b1ZpZXcoKVxuICBpZiAoYmIuYm90dG9tID4gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgaXRlbS5zY3JvbGxJbnRvVmlldyhmYWxzZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBEcm9wU2hhZG93KGhlaWdodCwgY2xzTmFtZSkge1xuICB0aGlzLm5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZChjbHNOYW1lIHx8ICdsaXN0bGVzc19fZHJvcC1zaGFkb3cnKVxuICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCAxMFxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMubm9kZSlcbn1cblxuRHJvcFNoYWRvdy5wcm90b3R5cGUgPSB7XG4gIG1vdmVUbzogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgIHRoaXMubm9kZS5zdHlsZS50b3AgPSB0YXJnZXQuc2hvdy55IC0gdGhpcy5oZWlnaHQvMiArICdweCdcbiAgICB0aGlzLm5vZGUuc3R5bGUubGVmdCA9IHRhcmdldC5zaG93LmxlZnQgKyAncHgnXG4gICAgdGhpcy5ub2RlLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgJ3B4J1xuICAgIC8vIHRoaXMubm9kZS5zdHlsZS5oZWlnaHQgPSB0YXJnZXQuaGVpZ2h0ICsgMTAgKyAncHgnXG4gICAgdGhpcy5ub2RlLnN0eWxlLndpZHRoID0gdGFyZ2V0LnNob3cud2lkdGggKyAncHgnXG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMubm9kZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBEb21WaWV3TGF5ZXIobykge1xuICB0aGlzLmRvbSA9IHt9XG4gIHRoaXMucm9vdCA9IG51bGxcbiAgdGhpcy5vID0gb1xufVxuXG5Eb21WaWV3TGF5ZXIucHJvdG90eXBlID0ge1xuICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZG9tID0ge31cbiAgfSxcbiAgcmViYXNlOiBmdW5jdGlvbiAocm9vdCkge1xuICAgIHJvb3QucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5yb290LCByb290KVxuICB9LFxuICBkcm9wVGFyZ2V0czogZnVuY3Rpb24gKHJvb3QsIG1vZGVsLCBtb3ZpbmcsIHRvcCkge1xuICAgIHZhciB0YXJnZXRzID0gW11cbiAgICAgICwgYmMgPSB0aGlzLmRvbVtyb290XS5oZWFkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAsIHRhcmdldFxuICAgICAgLCBjaGlsZFRhcmdldFxuXG4gICAgaWYgKCF0b3ApIHtcbiAgICAgIHRhcmdldCA9IHtcbiAgICAgICAgaWQ6IHJvb3QsXG4gICAgICAgIHRvcDogYmMudG9wLFxuICAgICAgICBsZWZ0OiBiYy5sZWZ0LFxuICAgICAgICB3aWR0aDogYmMud2lkdGgsXG4gICAgICAgIGhlaWdodDogYmMuaGVpZ2h0LFxuICAgICAgICBwbGFjZTogJ2FmdGVyJywgLy8gJ2JlZm9yZScsXG4gICAgICAgIHNob3c6IHtcbiAgICAgICAgICBsZWZ0OiBiYy5sZWZ0LC8vICsgMjAsXG4gICAgICAgICAgd2lkdGg6IGJjLndpZHRoLC8vIC0gMjAsXG4gICAgICAgICAgeTogYmMuYm90dG9tXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtb2RlbC5pZHNbcm9vdF0uY2hpbGRyZW4ubGVuZ3RoICYmICFtb2RlbC5pc0NvbGxhcHNlZChyb290KSkge1xuICAgICAgICAvLyBzaG93IGluc2VydCBiZWxvdyBjaGlsZHJlblxuICAgICAgICB0YXJnZXQuc2hvdy55ID0gdGhpcy5kb21bcm9vdF0udWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tXG4gICAgICB9XG4gICAgICB0YXJnZXRzLnB1c2godGFyZ2V0KVxuICAgIH1cbiAgICBpZiAocm9vdCA9PT0gbW92aW5nKSByZXR1cm4gdGFyZ2V0c1xuICAgIGNoaWxkVGFyZ2V0ID0ge1xuICAgICAgaWQ6IHJvb3QsXG4gICAgICB0b3A6IGJjLmJvdHRvbSAtIDcsXG4gICAgICBsZWZ0OiBiYy5sZWZ0ICsgMjAsXG4gICAgICB3aWR0aDogYmMud2lkdGgsXG4gICAgICBwbGFjZTogJ2NoaWxkJyxcbiAgICAgIHNob3c6IHtcbiAgICAgICAgbGVmdDogYmMubGVmdCArIDQwLFxuICAgICAgICB3aWR0aDogYmMud2lkdGggLSA0MCxcbiAgICAgICAgeTogYmMudG9wICsgYmMuaGVpZ2h0XG4gICAgICB9LFxuICAgICAgaGVpZ2h0OiA3XG4gICAgfVxuICAgIHRhcmdldHMucHVzaChjaGlsZFRhcmdldClcblxuICAgIGlmIChtb2RlbC5pc0NvbGxhcHNlZChyb290KSAmJiAhdG9wKSByZXR1cm4gdGFyZ2V0c1xuICAgIHZhciBjaCA9IG1vZGVsLmlkc1tyb290XS5jaGlsZHJlblxuICAgIGZvciAodmFyIGk9MDsgaTxjaC5sZW5ndGg7IGkrKykge1xuICAgICAgdGFyZ2V0cyA9IHRhcmdldHMuY29uY2F0KHRoaXMuZHJvcFRhcmdldHMoY2hbaV0sIG1vZGVsLCBtb3ZpbmcpKVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0c1xuICB9LFxuICBtYWtlRHJvcFNoYWRvdzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRHJvcFNoYWRvdygpXG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQsIHBpZCwgbGFzdGNoaWxkKSB7XG4gICAgdmFyIG4gPSB0aGlzLmRvbVtpZF1cbiAgICBpZiAoIW4ubWFpbi5wYXJlbnROb2RlKSByZXR1cm5cbiAgICB0cnkge1xuICAgICAgbi5tYWluLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobi5tYWluKVxuICAgIH0gY2F0Y2ggKGUpIHtyZXR1cm59XG4gICAgZGVsZXRlIHRoaXMuZG9tW2lkXVxuICAgIGlmIChsYXN0Y2hpbGQpIHtcbiAgICAgIHRoaXMuZG9tW3BpZF0ubWFpbi5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19faXRlbS0tcGFyZW50JylcbiAgICB9XG4gIH0sXG4gIGFkZE5ldzogZnVuY3Rpb24gKG5vZGUsIGJvdW5kcywgYmVmb3JlLCBjaGlsZHJlbikge1xuICAgIHZhciBkb20gPSB0aGlzLm1ha2VOb2RlKG5vZGUuaWQsIG5vZGUuZGF0YSwgbm9kZS5kZXB0aCAtIHRoaXMucm9vdERlcHRoLCBib3VuZHMpXG4gICAgdGhpcy5hZGQobm9kZS5wYXJlbnQsIGJlZm9yZSwgZG9tLCBjaGlsZHJlbilcbiAgICBpZiAobm9kZS5jb2xsYXBzZWQgJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0Q29sbGFwc2VkKG5vZGUuaWQsIHRydWUpXG4gICAgfVxuICB9LFxuICBhZGQ6IGZ1bmN0aW9uIChwYXJlbnQsIGJlZm9yZSwgZG9tLCBjaGlsZHJlbikge1xuICAgIHZhciBwID0gdGhpcy5kb21bcGFyZW50XVxuICAgIGlmIChiZWZvcmUgPT09IGZhbHNlKSB7XG4gICAgICBwLnVsLmFwcGVuZENoaWxkKGRvbSlcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJlZiA9IHRoaXMuZG9tW2JlZm9yZV1cbiAgICAgIHAudWwuaW5zZXJ0QmVmb3JlKGRvbSwgYmVmLm1haW4pXG4gICAgfVxuICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgZG9tLmNsYXNzTGlzdC5hZGQoJ2xpc3RsZXNzX19pdGVtLS1wYXJlbnQnKVxuICAgIH1cbiAgfSxcbiAgYm9keTogZnVuY3Rpb24gKGlkKSB7XG4gICAgaWYgKCF0aGlzLmRvbVtpZF0pIHJldHVyblxuICAgIHJldHVybiB0aGlzLmRvbVtpZF0uYm9keVxuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiAoaWQsIHBpZCwgYmVmb3JlLCBwcGlkLCBsYXN0Y2hpbGQpIHtcbiAgICB2YXIgZCA9IHRoaXMuZG9tW2lkXVxuICAgIGQubWFpbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGQubWFpbilcbiAgICBpZiAobGFzdGNoaWxkKSB7XG4gICAgICB0aGlzLmRvbVtwcGlkXS5tYWluLmNsYXNzTGlzdC5yZW1vdmUoJ2xpc3RsZXNzX19pdGVtLS1wYXJlbnQnKVxuICAgIH1cbiAgICBpZiAoYmVmb3JlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5kb21bcGlkXS51bC5hcHBlbmRDaGlsZChkLm1haW4pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9tW3BpZF0udWwuaW5zZXJ0QmVmb3JlKGQubWFpbiwgdGhpcy5kb21bYmVmb3JlXS5tYWluKVxuICAgIH1cbiAgICB0aGlzLmRvbVtwaWRdLm1haW4uY2xhc3NMaXN0LmFkZCgnbGlzdGxlc3NfX2l0ZW0tLXBhcmVudCcpXG4gIH0sXG4gIGNsZWFyU2VsZWN0aW9uOiBmdW5jdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgZm9yICh2YXIgaT0wOyBpPHNlbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLmRvbVtzZWxlY3Rpb25baV1dKSBjb250aW51ZTtcbiAgICAgIHRoaXMuZG9tW3NlbGVjdGlvbltpXV0ubWFpbi5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgfVxuICB9LFxuICBzaG93U2VsZWN0aW9uOiBmdW5jdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgaWYgKCFzZWxlY3Rpb24ubGVuZ3RoKSByZXR1cm5cbiAgICAvLyBlbnN1cmVJblZpZXcodGhpcy5kb21bc2VsZWN0aW9uWzBdXS5ib2R5Lm5vZGUpXG4gICAgZm9yICh2YXIgaT0wOyBpPHNlbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5kb21bc2VsZWN0aW9uW2ldXS5tYWluLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICB9XG4gIH0sXG5cbiAgY2xlYXJBY3RpdmU6IGZ1bmN0aW9uIChpZCkge1xuICAgIHRoaXMuZG9tW2lkXS5tYWluLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXG4gIH0sXG4gIHNob3dBY3RpdmU6IGZ1bmN0aW9uIChpZCkge1xuICAgIGVuc3VyZUluVmlldyh0aGlzLmRvbVtpZF0uYm9keS5ub2RlKVxuICAgIHRoaXMuZG9tW2lkXS5tYWluLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXG4gIH0sXG5cbiAgc2V0Q29sbGFwc2VkOiBmdW5jdGlvbiAoaWQsIGlzQ29sbGFwc2VkKSB7XG4gICAgdGhpcy5kb21baWRdLm1haW4uY2xhc3NMaXN0W2lzQ29sbGFwc2VkID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2NvbGxhcHNlZCcpXG4gIH0sXG5cbiAgc2V0TW92aW5nOiBmdW5jdGlvbiAoaWQsIGlzTW92aW5nKSB7XG4gICAgdGhpcy5yb290LmNsYXNzTGlzdFtpc01vdmluZyA/ICdhZGQnIDogJ3JlbW92ZSddKCdtb3ZpbmcnKVxuICAgIHRoaXMuZG9tW2lkXS5tYWluLmNsYXNzTGlzdFtpc01vdmluZyA/ICdhZGQnIDogJ3JlbW92ZSddKCdtb3ZpbmcnKVxuICB9LFxuXG4gIHNldERyb3BwaW5nOiBmdW5jdGlvbiAoaWQsIGlzRHJvcHBpbmcsIGlzQ2hpbGQpIHtcbiAgICB2YXIgY2xzID0gJ2Ryb3BwaW5nJyArIChpc0NoaWxkID8gJy1jaGlsZCcgOiAnJylcbiAgICB0aGlzLmRvbVtpZF0ubWFpbi5jbGFzc0xpc3RbaXNEcm9wcGluZyA/ICdhZGQnIDogJ3JlbW92ZSddKGNscylcbiAgfSxcblxuICBtYWtlUm9vdDogZnVuY3Rpb24gKG5vZGUsIGJvdW5kcykge1xuICAgIHZhciBkb20gPSB0aGlzLm1ha2VOb2RlKG5vZGUuaWQsIG5vZGUuZGF0YSwgMCwgYm91bmRzKVxuICAgICAgLCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICByb290LmNsYXNzTGlzdC5hZGQoJ2xpc3RsZXNzJylcbiAgICByb290LmFwcGVuZENoaWxkKGRvbSlcbiAgICBpZiAobm9kZS5jb2xsYXBzZWQgJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0Q29sbGFwc2VkKG5vZGUuaWQsIHRydWUpXG4gICAgfVxuICAgIHRoaXMucm9vdCA9IHJvb3RcbiAgICB0aGlzLnJvb3REZXB0aCA9IG5vZGUuZGVwdGhcbiAgICByZXR1cm4gcm9vdFxuICB9LFxuXG4gIG1ha2VIZWFkOiBmdW5jdGlvbiAoYm9keSwgYWN0aW9ucykge1xuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICwgY29sbGFwc2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICwgbW92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgY29sbGFwc2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgYWN0aW9ucy50b2dnbGVDb2xsYXBzZSgpXG4gICAgfSlcbiAgICBjb2xsYXBzZXIuY2xhc3NMaXN0LmFkZCgnbGlzdGxlc3NfX2NvbGxhcHNlcicpXG5cbiAgICBtb3Zlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKGUuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgYWN0aW9ucy5zdGFydE1vdmluZygpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICAgIG1vdmVyLmNsYXNzTGlzdC5hZGQoJ2xpc3RsZXNzX19tb3ZlcicpXG5cbiAgICBoZWFkLmNsYXNzTGlzdC5hZGQoJ2xpc3RsZXNzX19oZWFkJylcbiAgICBoZWFkLmFwcGVuZENoaWxkKGNvbGxhcHNlcilcbiAgICBoZWFkLmFwcGVuZENoaWxkKGJvZHkubm9kZSk7XG4gICAgaGVhZC5hcHBlbmRDaGlsZChtb3ZlcilcbiAgICByZXR1cm4gaGVhZFxuICB9LFxuXG4gIG1ha2VOb2RlOiBmdW5jdGlvbiAoaWQsIGRhdGEsIGxldmVsLCBib3VuZHMpIHtcbiAgICB2YXIgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgLCBib2R5ID0gdGhpcy5ib2R5Rm9yKGlkLCBkYXRhLCBib3VuZHMpXG5cbiAgICBkb20uY2xhc3NMaXN0LmFkZCgnbGlzdGxlc3NfX2l0ZW0nKVxuICAgIC8vIGRvbS5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19faXRlbS0tbGV2ZWwtJyArIGxldmVsKVxuXG4gICAgdmFyIGhlYWQgPSB0aGlzLm1ha2VIZWFkKGJvZHksIGJvdW5kcylcbiAgICBkb20uYXBwZW5kQ2hpbGQoaGVhZClcblxuICAgIHZhciB1bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJylcbiAgICB1bC5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19fY2hpbGRyZW4nKVxuICAgIGRvbS5hcHBlbmRDaGlsZCh1bClcbiAgICB0aGlzLmRvbVtpZF0gPSB7bWFpbjogZG9tLCBib2R5OiBib2R5LCB1bDogdWwsIGhlYWQ6IGhlYWR9XG4gICAgcmV0dXJuIGRvbVxuICB9LFxuXG4gIC8qKiByZXR1cm5zIGEgZG9tIG5vZGUgKiovXG4gIGJvZHlGb3I6IGZ1bmN0aW9uIChpZCwgZGF0YSwgYm91bmRzKSB7XG4gICAgdmFyIGRvbSA9IG5ldyB0aGlzLm8ubm9kZShkYXRhLCBib3VuZHMsIGlkID09PSAnbmV3JylcbiAgICBkb20ubm9kZS5jbGFzc0xpc3QuYWRkKCdsaXN0bGVzc19fYm9keScpXG4gICAgcmV0dXJuIGRvbVxuICB9LFxuXG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBEdW1iUExcblxuZnVuY3Rpb24gRHVtYlBMKCkge1xuICB0aGlzLmRhdGEgPSB7fVxufVxuXG5EdW1iUEwucHJvdG90eXBlID0ge1xuICBzYXZlOiBmdW5jdGlvbiAodHlwZSwgaWQsIGRhdGEpIHtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAodHlwZSwgaWQsIHVwZGF0ZSkge1xuICB9LFxuICBmaW5kQWxsOiBmdW5jdGlvbiAodHlwZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzLCByZWopIHtcbiAgICAgIHJlcyhbXSlcbiAgICB9KVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uICh0eXBlLCBpZCkge1xuICB9XG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBrZXlzXG5cbnZhciBLRVlTID0ge1xuICA4OiAnYmFja3NwYWNlJyxcbiAgOTogJ3RhYicsXG4gIDEzOiAncmV0dXJuJyxcbiAgMjc6ICdlc2NhcGUnLFxuICAzNzogJ2xlZnQnLFxuICAzODogJ3VwJyxcbiAgMzk6ICdyaWdodCcsXG4gIDQwOiAnZG93bicsXG4gIDQ2OiAnZGVsZXRlJyxcbiAgMTEzOiAnZjInLFxuICAyMTk6ICdbJyxcbiAgMjIxOiAnXSdcbn1cblxuZnVuY3Rpb24ga2V5TmFtZShjb2RlKSB7XG4gIGlmIChjb2RlIDw9IDkwICYmIGNvZGUgPj0gNjUpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlICsgMzIpXG4gIH1cbiAgcmV0dXJuIEtFWVNbY29kZV1cbn1cblxuZnVuY3Rpb24ga2V5cyhjb25maWcpIHtcbiAgdmFyIGttYXAgPSB7fVxuICAgICwgcHJlZml4ZXMgPSB7fVxuICAgICwgY3VyX3ByZWZpeCA9IG51bGxcbiAgICAsIHBhcnRzXG4gICAgLCBwYXJ0XG4gICAgLCBzZXFcbiAgZm9yICh2YXIgbmFtZSBpbiBjb25maWcpIHtcbiAgICBwYXJ0cyA9IG5hbWUuc3BsaXQoJywnKVxuICAgIGZvciAodmFyIGk9MDtpPHBhcnRzLmxlbmd0aDtpKyspIHtcbiAgICAgIHBhcnQgPSBwYXJ0c1tpXS50cmltKClcbiAgICAgIGttYXBbcGFydF0gPSBjb25maWdbbmFtZV1cbiAgICAgIGlmIChwYXJ0LmluZGV4T2YoJyAnKSAhPT0gLTEpIHtcbiAgICAgICAgc2VxID0gcGFydC5zcGxpdCgvXFxzKy9nKVxuICAgICAgICB2YXIgbiA9ICcnXG4gICAgICAgIGZvciAodmFyIGo9MDsgajxzZXEubGVuZ3RoLTE7IGorKykge1xuICAgICAgICAgIG4gKz0gc2VxW2pdXG4gICAgICAgICAgcHJlZml4ZXNbbl0gPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIG5hbWUgPSBrZXlOYW1lKGUua2V5Q29kZSlcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlLmtleUNvZGUpXG4gICAgfVxuICAgIGlmIChlLmFsdEtleSkgbmFtZSA9ICdhbHQrJyArIG5hbWVcbiAgICBpZiAoZS5zaGlmdEtleSkgbmFtZSA9ICdzaGlmdCsnICsgbmFtZVxuICAgIGlmIChlLmN0cmxLZXkpIG5hbWUgPSAnY3RybCsnICsgbmFtZVxuICAgIGlmIChjdXJfcHJlZml4KSB7XG4gICAgICBuYW1lID0gY3VyX3ByZWZpeCArICcgJyArIG5hbWVcbiAgICAgIGN1cl9wcmVmaXggPSBudWxsXG4gICAgfVxuICAgIGlmICgha21hcFtuYW1lXSkge1xuICAgICAgaWYgKHByZWZpeGVzW25hbWVdKSB7XG4gICAgICAgIGN1cl9wcmVmaXggPSBuYW1lXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJfcHJlZml4ID0gbnVsbFxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChrbWFwW25hbWVdLmNhbGwodGhpcywgZSkgIT09IHRydWUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsUExcblxuZnVuY3Rpb24gTG9jYWxQTCgpIHtcbn1cblxuTG9jYWxQTC5wcm90b3R5cGUgPSB7XG4gIHNhdmU6IGZ1bmN0aW9uICh0eXBlLCBpZCwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCdzYXZpbmcnLCB0eXBlLCBkYXRhKVxuICAgIGxvY2FsU3RvcmFnZVt0eXBlICsgJzonICsgaWRdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgfSxcbiAgZmluZDogZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW3R5cGUgKyAnOicgKyBpZF0pXG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHR5cGUsIGlkLCB1cGRhdGUpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuZmluZCh0eXBlLCBpZClcbiAgICBjb25zb2xlLmxvZygndXBkYXRpbmchJywgdHlwZSwgaWQsIHVwZGF0ZSwgbm9kZSlcbiAgICBmb3IgKHZhciBuYW1lIGluIHVwZGF0ZSkge1xuICAgICAgbm9kZVtuYW1lXSA9IHVwZGF0ZVtuYW1lXVxuICAgIH1cbiAgICB0aGlzLnNhdmUodHlwZSwgaWQsIG5vZGUpXG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gICAgY29uc29sZS5sb2coJ3JlbW92aW5nJywgdHlwZSwgaWQpXG4gICAgZGVsZXRlIGxvY2FsU3RvcmFnZVt0eXBlICsgJzonICsgaWRdXG4gIH0sXG4gIGZpbmRBbGw6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICBmb3IgKHZhciBuYW1lIGluIGxvY2FsU3RvcmFnZSkge1xuICAgICAgaWYgKG5hbWUuaW5kZXhPZih0eXBlICsgJzonKSAhPT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGl0ZW1zLnB1c2goSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2VbbmFtZV0pKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlcywgcmVqKSB7XG4gICAgICByZXMoaXRlbXMpXG4gICAgfSlcbiAgfSxcbn1cblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IE1lbVBMXG5cbmZ1bmN0aW9uIE1lbVBMKCkge1xuICB0aGlzLmRhdGEgPSB7fVxufVxuXG5NZW1QTC5wcm90b3R5cGUgPSB7XG4gIHNhdmU6IGZ1bmN0aW9uICh0eXBlLCBpZCwgZGF0YSkge1xuICAgIGlmICghdGhpcy5kYXRhW3R5cGVdKSB7XG4gICAgICB0aGlzLmRhdGFbdHlwZV0gPSB7fVxuICAgIH1cbiAgICB0aGlzLmRhdGFbdHlwZV1baWRdID0gZGF0YVxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICh0eXBlLCBpZCwgdXBkYXRlKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB1cGRhdGUpIHtcbiAgICAgIHRoaXMuZGF0YVt0eXBlXVtpZF1bbmFtZV0gPSB1cGRhdGVbbmFtZV1cbiAgICB9XG4gIH0sXG4gIGZpbmRBbGw6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICBpZiAodGhpcy5kYXRhW3R5cGVdKSB7XG4gICAgICBmb3IgKHZhciBpZCBpbiB0aGlzLmRhdGFbdHlwZV0pIHtcbiAgICAgICAgaXRlbXMucHVzaCh0aGlzLmRhdGFbdHlwZV1baWRdKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlcywgcmVqKSB7XG4gICAgICByZXMoaXRlbXMpXG4gICAgfSlcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAodHlwZSwgaWQpIHtcbiAgICBkZWxldGUgdGhpcy5kYXRhW3R5cGVdW2lkXVxuICB9XG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbFxuXG5cbmZ1bmN0aW9uIE1vZGVsKHJvb3QsIGlkcywgZGIpIHtcbiAgdGhpcy5pZHMgPSBpZHNcbiAgdGhpcy5yb290ID0gcm9vdFxuICB0aGlzLmRiID0gZGJcbiAgdGhpcy5uZXh0aWQgPSAxMDBcbiAgdGhpcy5jbGlwYm9hcmQgPSBmYWxzZVxufVxuXG4vKipcbiAqIEEgc2luZ2xlIG5vZGUgaXNcbiAqIC0gaWQ6XG4gKiAtIHBhcmVudDogaWRcbiAqIC0gY2hpbGRyZW46IFtpZCwgaWQsIGlkXVxuICogLSBkYXRhOiB7fVxuICovXG5cbk1vZGVsLnByb3RvdHlwZSA9IHtcbiAgbmV3aWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB3aGlsZSAodGhpcy5pZHNbdGhpcy5uZXh0aWRdKSB7XG4gICAgICB0aGlzLm5leHRpZCArPSAxXG4gICAgfVxuICAgIHZhciBpZCA9IHRoaXMubmV4dGlkXG4gICAgdGhpcy5uZXh0aWQgKz0gMVxuICAgIHJldHVybiBpZFxuICB9LFxuXG4gIGR1bXBEYXRhOiBmdW5jdGlvbiAoaWQsIG5vaWRzKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlkID0gdGhpcy5yb290XG4gICAgfVxuICAgIHZhciByZXMgPSB7fVxuICAgICAgLCBuID0gdGhpcy5pZHNbaWRdXG4gICAgZm9yICh2YXIgbmFtZSBpbiBuLmRhdGEpIHtcbiAgICAgIHJlc1tuYW1lXSA9IG4uZGF0YVtuYW1lXVxuICAgIH1cbiAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJlcy5jaGlsZHJlbiA9IFtdXG4gICAgICBmb3IgKHZhciBpPTA7IGk8bi5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMuY2hpbGRyZW4ucHVzaCh0aGlzLmR1bXBEYXRhKG4uY2hpbGRyZW5baV0sIG5vaWRzKSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFub2lkcykgcmVzLmlkID0gaWRcbiAgICByZXMuY29sbGFwc2VkID0gbi5jb2xsYXBzZWRcbiAgICByZXR1cm4gcmVzXG4gIH0sXG5cbiAgY3JlYXRlTm9kZXM6IGZ1bmN0aW9uIChwaWQsIGluZGV4LCBkYXRhKSB7XG4gICAgdmFyIGNyID0gdGhpcy5jcmVhdGUocGlkLCBpbmRleCwgZGF0YS5uYW1lKVxuICAgIGNyLm5vZGUuY29sbGFwc2VkID0gZGF0YS5jb2xsYXBzZWRcbiAgICBpZiAoZGF0YS5jaGlsZHJlbikge1xuICAgICAgZm9yICh2YXIgaT0wOyBpPGRhdGEuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5jcmVhdGVOb2Rlcyhjci5ub2RlLmlkLCBpLCBkYXRhLmNoaWxkcmVuW2ldKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3JcbiAgfSxcblxuICBnZXRCZWZvcmU6IGZ1bmN0aW9uIChwaWQsIGluZGV4KSB7XG4gICAgdmFyIGJlZm9yZSA9IGZhbHNlXG4gICAgaWYgKGluZGV4IDwgdGhpcy5pZHNbcGlkXS5jaGlsZHJlbi5sZW5ndGggLSAxKSB7XG4gICAgICBiZWZvcmUgPSB0aGlzLmlkc1twaWRdLmNoaWxkcmVuW2luZGV4ICsgMV1cbiAgICB9XG4gICAgcmV0dXJuIGJlZm9yZVxuICB9LFxuXG4gIC8vIG9wZXJhdGlvbnNcbiAgY3JlYXRlOiBmdW5jdGlvbiAocGlkLCBpbmRleCwgdGV4dCkge1xuICAgIHZhciBub2RlID0ge1xuICAgICAgaWQ6IHRoaXMubmV3aWQoKSxcbiAgICAgIGRhdGE6IHtuYW1lOiB0ZXh0IHx8ICcnLCBkb25lOiBmYWxzZX0sXG4gICAgICBwYXJlbnQ6IHBpZCxcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH1cbiAgICB0aGlzLmlkc1tub2RlLmlkXSA9IG5vZGVcbiAgICB0aGlzLmlkc1twaWRdLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMCwgbm9kZS5pZClcblxuICAgIHZhciBiZWZvcmUgPSBmYWxzZVxuICAgIGlmIChpbmRleCA8IHRoaXMuaWRzW3BpZF0uY2hpbGRyZW4ubGVuZ3RoIC0gMSkge1xuICAgICAgYmVmb3JlID0gdGhpcy5pZHNbcGlkXS5jaGlsZHJlbltpbmRleCArIDFdXG4gICAgfVxuXG4gICAgdGhpcy5kYi5zYXZlKCdub2RlJywgbm9kZS5pZCwgbm9kZSlcbiAgICB0aGlzLmRiLnVwZGF0ZSgnbm9kZScsIHBpZCwge2NoaWxkcmVuOiB0aGlzLmlkc1twaWRdLmNoaWxkcmVufSlcblxuICAgIHJldHVybiB7XG4gICAgICBub2RlOiBub2RlLFxuICAgICAgYmVmb3JlOiBiZWZvcmVcbiAgICB9XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgaWYgKGlkID09PSB0aGlzLnJvb3QpIHJldHVyblxuICAgIHZhciBuID0gdGhpcy5pZHNbaWRdXG4gICAgICAsIHAgPSB0aGlzLmlkc1tuLnBhcmVudF1cbiAgICAgICwgaXggPSBwLmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgcC5jaGlsZHJlbi5zcGxpY2UoaXgsIDEpXG4gICAgZGVsZXRlIHRoaXMuaWRzW2lkXVxuXG4gICAgdGhpcy5kYi5yZW1vdmUoJ25vZGUnLCBpZClcbiAgICB0aGlzLmRiLnVwZGF0ZSgnbm9kZScsIG4ucGFyZW50LCB7Y2hpbGRyZW46IHAuY2hpbGRyZW59KVxuICAgIC8vIFRPRE86IHJlbW92ZSBhbGwgY2hpbGQgbm9kZXNcblxuICAgIHJldHVybiB7aWQ6IGlkLCBub2RlOiBuLCBpeDogaXh9XG4gIH0sXG4gIHNldEF0dHI6IGZ1bmN0aW9uIChpZCwgYXR0ciwgdmFsdWUpIHtcbiAgICB0aGlzLmlkc1tpZF0uZGF0YVthdHRyXSA9IHZhbHVlXG4gICAgdGhpcy5kYi51cGRhdGUoJ25vZGUnLCBpZCwge2RhdGE6IHRoaXMuaWRzW2lkXS5kYXRhfSlcbiAgfSxcbiAgc2V0RGF0YTogZnVuY3Rpb24gKGlkLCBkYXRhKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLmlkc1tpZF0uZGF0YVtuYW1lXSA9IGRhdGFbbmFtZV1cbiAgICB9XG4gICAgdGhpcy5kYi51cGRhdGUoJ25vZGUnLCBpZCwgZGF0YSlcbiAgfSxcblxuICAvLyBvdGhlciBzdHVmZlxuICBzZXRDb2xsYXBzZWQ6IGZ1bmN0aW9uIChpZCwgaXNDb2xsYXBzZWQpIHtcbiAgICB0aGlzLmlkc1tpZF0uY29sbGFwc2VkID0gaXNDb2xsYXBzZWRcbiAgICB0aGlzLmRiLnVwZGF0ZSgnbm9kZScsIGlkLCB7Y29sbGFwc2VkOiBpc0NvbGxhcHNlZH0pXG4gIH0sXG4gIGlzQ29sbGFwc2VkOiBmdW5jdGlvbiAoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5pZHNbaWRdLmNvbGxhcHNlZFxuICB9LFxuICBoYXNDaGlsZHJlbjogZnVuY3Rpb24gKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuaWRzW2lkXS5jaGlsZHJlbi5sZW5ndGhcbiAgfSxcbiAgLy8gYWRkIGJhY2sgc29tZXRoaW5nIHRoYXQgd2FzIHJlbW92ZWRcbiAgcmVhZGQ6IGZ1bmN0aW9uIChzYXZlZCkge1xuICAgIHRoaXMuaWRzW3NhdmVkLmlkXSA9IHNhdmVkLm5vZGVcbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmlkc1tzYXZlZC5ub2RlLnBhcmVudF0uY2hpbGRyZW5cbiAgICBjaGlsZHJlbi5zcGxpY2Uoc2F2ZWQuaXgsIDAsIHNhdmVkLmlkKVxuICAgIHZhciBiZWZvcmUgPSBmYWxzZVxuICAgIGlmIChzYXZlZC5peCA8IGNoaWxkcmVuLmxlbmd0aCAtIDEpIHtcbiAgICAgIGJlZm9yZSA9IGNoaWxkcmVuW3NhdmVkLml4ICsgMV1cbiAgICB9XG4gICAgdGhpcy5kYi5zYXZlKCdub2RlJywgc2F2ZWQubm9kZS5pZCwgc2F2ZWQubm9kZSlcbiAgICB0aGlzLmRiLnVwZGF0ZSgnbm9kZScsIHNhdmVkLm5vZGUucGFyZW50LCB7Y2hpbGRyZW46IGNoaWxkcmVufSlcbiAgICByZXR1cm4gYmVmb3JlXG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIChpZCwgcGlkLCBpbmRleCkge1xuICAgIHZhciBuID0gdGhpcy5pZHNbaWRdXG4gICAgICAsIG9waWQgPSBuLnBhcmVudFxuICAgICAgLCBwID0gdGhpcy5pZHNbb3BpZF1cbiAgICAgICwgaXggPSBwLmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgcC5jaGlsZHJlbi5zcGxpY2UoaXgsIDEpXG4gICAgaWYgKGluZGV4ID09PSBmYWxzZSkgaW5kZXggPSB0aGlzLmlkc1twaWRdLmNoaWxkcmVuLmxlbmd0aFxuICAgIHRoaXMuaWRzW3BpZF0uY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAwLCBpZClcbiAgICB0aGlzLmlkc1tpZF0ucGFyZW50ID0gcGlkXG5cbiAgICB0aGlzLmRiLnVwZGF0ZSgnbm9kZScsIG9waWQsIHtjaGlsZHJlbjogcC5jaGlsZHJlbn0pXG4gICAgdGhpcy5kYi51cGRhdGUoJ25vZGUnLCBwaWQsIHtjaGlsZHJlbjogdGhpcy5pZHNbcGlkXS5jaGlsZHJlbn0pXG4gICAgdGhpcy5kYi51cGRhdGUoJ25vZGUnLCBpZCwge3BhcmVudDogcGlkfSlcblxuICAgIHZhciBiZWZvcmUgPSBmYWxzZVxuICAgIGlmIChpbmRleCA8IHRoaXMuaWRzW3BpZF0uY2hpbGRyZW4ubGVuZ3RoIC0gMSkge1xuICAgICAgYmVmb3JlID0gdGhpcy5pZHNbcGlkXS5jaGlsZHJlbltpbmRleCArIDFdXG4gICAgfVxuICAgIHJldHVybiBiZWZvcmVcbiAgfSxcbiAgYXBwZW5kVGV4dDogZnVuY3Rpb24gKGlkLCB0ZXh0KSB7XG4gICAgdGhpcy5pZHNbaWRdLmRhdGEubmFtZSArPSB0ZXh0XG4gICAgdGhpcy5kYi51cGRhdGUoJ25vZGUnLCBpZCwge2RhdGE6IHRoaXMuaWRzW2lkXS5kYXRhfSlcbiAgfSxcblxuICAvLyBtb3ZlbWVudCBjYWxjdWxhdGlvblxuICBnZXRQYXJlbnQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIHJldHVybiB0aGlzLmlkc1tpZF0ucGFyZW50XG4gIH0sXG4gIGNvbW1vblBhcmVudDogZnVuY3Rpb24gKG9uZSwgdHdvKSB7XG4gICAgaWYgKG9uZSA9PT0gdHdvKSByZXR1cm4gb25lXG4gICAgdmFyIG9uZXMgPSBbb25lXVxuICAgICAgLCB0d29zID0gW3R3b11cbiAgICB3aGlsZSAodGhpcy5pZHNbb25lXS5wYXJlbnQgfHwgdGhpcy5pZHNbdHdvXS5wYXJlbnQpIHtcbiAgICAgIGlmICh0aGlzLmlkc1tvbmVdLnBhcmVudCkge1xuICAgICAgICBvbmUgPSB0aGlzLmlkc1tvbmVdLnBhcmVudFxuICAgICAgICBpZiAodHdvcy5pbmRleE9mKG9uZSkgIT09IC0xKSByZXR1cm4gb25lXG4gICAgICAgIG9uZXMucHVzaChvbmUpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pZHNbdHdvXS5wYXJlbnQpIHtcbiAgICAgICAgdHdvID0gdGhpcy5pZHNbdHdvXS5wYXJlbnRcbiAgICAgICAgaWYgKG9uZXMuaW5kZXhPZih0d28pICE9PSAtMSkgcmV0dXJuIHR3b1xuICAgICAgICB0d29zLnB1c2godHdvKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9LFxuICBnZXRDaGlsZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgaWYgKHRoaXMuaWRzW2lkXS5jaGlsZHJlbiAmJiB0aGlzLmlkc1tpZF0uY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pZHNbaWRdLmNoaWxkcmVuWzBdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5leHRTaWJsaW5nKGlkKVxuICB9LFxuICBwcmV2U2libGluZzogZnVuY3Rpb24gKGlkLCBub3BhcmVudCkge1xuICAgIHZhciBwaWQgPSB0aGlzLmlkc1tpZF0ucGFyZW50XG4gICAgaWYgKHVuZGVmaW5lZCA9PT0gcGlkKSByZXR1cm5cbiAgICB2YXIgaXggPSB0aGlzLmlkc1twaWRdLmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgaWYgKGl4ID4gMCkgcmV0dXJuIHRoaXMuaWRzW3BpZF0uY2hpbGRyZW5baXgtMV1cbiAgICBpZiAoIW5vcGFyZW50KSByZXR1cm4gcGlkXG4gIH0sXG4gIG5leHRTaWJsaW5nOiBmdW5jdGlvbiAoaWQsIHN0cmljdCkge1xuICAgIHZhciBwaWQgPSB0aGlzLmlkc1tpZF0ucGFyZW50XG4gICAgaWYgKHVuZGVmaW5lZCA9PT0gcGlkKSByZXR1cm4gIXN0cmljdCAmJiB0aGlzLmlkc1tpZF0uY2hpbGRyZW5bMF1cbiAgICB2YXIgaXggPSB0aGlzLmlkc1twaWRdLmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgaWYgKGl4IDwgdGhpcy5pZHNbcGlkXS5jaGlsZHJlbi5sZW5ndGggLSAxKSByZXR1cm4gdGhpcy5pZHNbcGlkXS5jaGlsZHJlbltpeCArIDFdXG4gICAgaWYgKHRoaXMuaWRzW2lkXS5jb2xsYXBzZWQpIHtcbiAgICAgIHJldHVybiAhc3RyaWN0ICYmIHRoaXMubmV4dFNpYmxpbmcocGlkLCBzdHJpY3QpXG4gICAgfVxuICAgIHJldHVybiAhc3RyaWN0ICYmIHRoaXMuaWRzW2lkXS5jaGlsZHJlblswXVxuICB9LFxuICBsYXN0U2libGluZzogZnVuY3Rpb24gKGlkLCBzdHJpY3QpIHtcbiAgICB2YXIgcGlkID0gdGhpcy5pZHNbaWRdLnBhcmVudFxuICAgIGlmICh1bmRlZmluZWQgPT09IHBpZCkgcmV0dXJuICFzdHJpY3QgJiYgdGhpcy5pZHNbaWRdLmNoaWxkcmVuWzBdXG4gICAgdmFyIGl4ID0gdGhpcy5pZHNbcGlkXS5jaGlsZHJlbi5pbmRleE9mKGlkKVxuICAgIGlmIChpeCA9PT0gdGhpcy5pZHNbcGlkXS5jaGlsZHJlbi5sZW5ndGggLSAxKSByZXR1cm4gIXN0cmljdCAmJiB0aGlzLmlkc1tpZF0uY2hpbGRyZW5bMF1cbiAgICByZXR1cm4gdGhpcy5pZHNbcGlkXS5jaGlsZHJlblt0aGlzLmlkc1twaWRdLmNoaWxkcmVuLmxlbmd0aCAtIDFdXG4gIH0sXG4gIGZpcnN0U2libGluZzogZnVuY3Rpb24gKGlkLCBzdHJpY3QpIHtcbiAgICB2YXIgcGlkID0gdGhpcy5pZHNbaWRdLnBhcmVudFxuICAgIGlmICh1bmRlZmluZWQgPT09IHBpZCkgcmV0dXJuIC8vIHRoaXMuaWRzW2lkXS5jaGlsZHJlblswXVxuICAgIHZhciBpeCA9IHRoaXMuaWRzW3BpZF0uY2hpbGRyZW4uaW5kZXhPZihpZClcbiAgICBpZiAoaXggPT09IDApIHJldHVybiAhc3RyaWN0ICYmIHBpZFxuICAgIHJldHVybiB0aGlzLmlkc1twaWRdLmNoaWxkcmVuWzBdXG4gIH0sXG4gIGxhc3RPcGVuOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuaWRzW2lkXVxuICAgIHdoaWxlIChub2RlLmNoaWxkcmVuLmxlbmd0aCAmJiAobm9kZS5pZCA9PT0gaWQgfHwgIW5vZGUuY29sbGFwc2VkKSkge1xuICAgICAgbm9kZSA9IHRoaXMuaWRzW25vZGUuY2hpbGRyZW5bbm9kZS5jaGlsZHJlbi5sZW5ndGggLSAxXV1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGUuaWRcbiAgfSxcbiAgaWRBYm92ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHBpZCA9IHRoaXMuaWRzW2lkXS5wYXJlbnRcbiAgICAgICwgcGFyZW50ID0gdGhpcy5pZHNbcGlkXVxuICAgIGlmICghcGFyZW50KSByZXR1cm5cbiAgICB2YXIgaXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihpZClcbiAgICBpZiAoaXggPT09IDApIHtcbiAgICAgIHJldHVybiBwaWRcbiAgICB9XG4gICAgdmFyIHByZXZpZCA9IHBhcmVudC5jaGlsZHJlbltpeCAtIDFdXG4gICAgd2hpbGUgKHRoaXMuaWRzW3ByZXZpZF0uY2hpbGRyZW4gJiZcbiAgICAgICAgICAgdGhpcy5pZHNbcHJldmlkXS5jaGlsZHJlbi5sZW5ndGggJiZcbiAgICAgICAgICAgIXRoaXMuaWRzW3ByZXZpZF0uY29sbGFwc2VkKSB7XG4gICAgICBwcmV2aWQgPSB0aGlzLmlkc1twcmV2aWRdLmNoaWxkcmVuW3RoaXMuaWRzW3ByZXZpZF0uY2hpbGRyZW4ubGVuZ3RoIC0gMV1cbiAgICB9XG4gICAgcmV0dXJuIHByZXZpZFxuICB9LFxuICAvLyBnZXQgdGhlIHBsYWNlIHRvIHNoaWZ0IGxlZnQgdG9cbiAgc2hpZnRMZWZ0UGxhY2U6IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBwaWQgPSB0aGlzLmlkc1tpZF0ucGFyZW50XG4gICAgICAsIHBhcmVudCA9IHRoaXMuaWRzW3BpZF1cbiAgICBpZiAoIXBhcmVudCkgcmV0dXJuXG4gICAgdmFyIHBwaWQgPSBwYXJlbnQucGFyZW50XG4gICAgICAsIHBwYXJlbnQgPSB0aGlzLmlkc1twcGlkXVxuICAgIGlmICghcHBhcmVudCkgcmV0dXJuXG4gICAgdmFyIHBpeCA9IHBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihwaWQpXG4gICAgcmV0dXJuIHtcbiAgICAgIHBpZDogcHBpZCxcbiAgICAgIGl4OiBwaXggKyAxXG4gICAgfVxuICB9LFxuICBzaGlmdFVwUGxhY2U6IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBwaWQgPSB0aGlzLmlkc1tpZF0ucGFyZW50XG4gICAgICAsIHBhcmVudCA9IHRoaXMuaWRzW3BpZF1cbiAgICBpZiAoIXBhcmVudCkgcmV0dXJuXG4gICAgdmFyIGl4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgaWYgKGl4ID09PSAwKSB7XG4gICAgICB2YXIgcGwgPSB0aGlzLnNoaWZ0TGVmdFBsYWNlKGlkKVxuICAgICAgaWYgKCFwbCkgcmV0dXJuXG4gICAgICBwbC5peCAtPSAxXG4gICAgICByZXR1cm4gcGxcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHBpZDogcGlkLFxuICAgICAgaXg6IGl4IC0gMVxuICAgIH1cbiAgfSxcbiAgc2hpZnREb3duUGxhY2U6IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBwaWQgPSB0aGlzLmlkc1tpZF0ucGFyZW50XG4gICAgICAsIHBhcmVudCA9IHRoaXMuaWRzW3BpZF1cbiAgICBpZiAoIXBhcmVudCkgcmV0dXJuXG4gICAgdmFyIGl4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgaWYgKGl4ID49IHBhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaGlmdExlZnRQbGFjZShpZClcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHBpZDogcGlkLFxuICAgICAgaXg6IGl4ICsgMVxuICAgIH1cbiAgfSxcbiAgbW92ZUJlZm9yZVBsYWNlOiBmdW5jdGlvbiAoaWQsIHRpZCkge1xuICAgIHZhciBzaWIgPSB0aGlzLmlkc1tpZF1cbiAgICAgICwgcGlkID0gc2liLnBhcmVudFxuICAgICAgLCBvcGlkID0gdGhpcy5pZHNbdGlkXS5wYXJlbnRcbiAgICBpZiAodW5kZWZpbmVkID09PSBwaWQpIHJldHVyblxuICAgIHZhciBwYXJlbnQgPSB0aGlzLmlkc1twaWRdXG4gICAgcmV0dXJuIHtcbiAgICAgIHBpZDogcGlkLFxuICAgICAgaXg6IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKGlkKVxuICAgIH1cbiAgfSxcbiAgbW92ZUFmdGVyUGxhY2U6IGZ1bmN0aW9uIChpZCwgb2lkKSB7XG4gICAgdmFyIHNpYiA9IHRoaXMuaWRzW2lkXVxuICAgICAgLCBwaWQgPSBzaWIucGFyZW50XG4gICAgICAsIG9waWQgPSB0aGlzLmlkc1tvaWRdLnBhcmVudFxuICAgIGlmICh1bmRlZmluZWQgPT09IHBpZCkgcmV0dXJuXG4gICAgdmFyIG9peCA9IHRoaXMuaWRzW29waWRdLmNoaWxkcmVuLmluZGV4T2Yob2lkKVxuICAgIHZhciBwYXJlbnQgPSB0aGlzLmlkc1twaWRdXG4gICAgICAsIGl4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YoaWQpICsgMVxuICAgIGlmICggcGlkID09PSBvcGlkICYmIGl4ID4gb2l4KSBpeCAtPSAxXG4gICAgcmV0dXJuIHtcbiAgICAgIHBpZDogcGlkLFxuICAgICAgaXg6IGl4XG4gICAgfVxuICB9LFxuICBpZEJlbG93OiBmdW5jdGlvbiAoaWQsIHJvb3QpIHtcbiAgICBpZiAodGhpcy5pZHNbaWRdLmNoaWxkcmVuICYmXG4gICAgICAgIHRoaXMuaWRzW2lkXS5jaGlsZHJlbi5sZW5ndGggJiZcbiAgICAgICAgKGlkID09PSByb290IHx8ICF0aGlzLmlkc1tpZF0uY29sbGFwc2VkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaWRzW2lkXS5jaGlsZHJlblswXVxuICAgIH1cbiAgICB2YXIgcGlkID0gdGhpcy5pZHNbaWRdLnBhcmVudFxuICAgICAgLCBwYXJlbnQgPSB0aGlzLmlkc1twaWRdXG4gICAgaWYgKCFwYXJlbnQpIHJldHVyblxuICAgIHZhciBpeCA9IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKGlkKVxuICAgIHdoaWxlIChpeCA9PT0gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCAtIDEpIHtcbiAgICAgIHBhcmVudCA9IHRoaXMuaWRzW3BhcmVudC5wYXJlbnRdXG4gICAgICBpZiAoIXBhcmVudCkgcmV0dXJuXG4gICAgICBpeCA9IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHBpZClcbiAgICAgIHBpZCA9IHBhcmVudC5pZFxuICAgIH1cbiAgICByZXR1cm4gcGFyZW50LmNoaWxkcmVuW2l4ICsgMV1cbiAgfSxcbiAgaWROZXc6IGZ1bmN0aW9uIChpZCwgYmVmb3JlLCByb290KSB7XG4gICAgdmFyIHBpZCA9IHRoaXMuaWRzW2lkXS5wYXJlbnRcbiAgICAgICwgcGFyZW50XG4gICAgICAsIG5peFxuICAgIGlmIChiZWZvcmUpIHtcbiAgICAgIHBhcmVudCA9IHRoaXMuaWRzW3BpZF1cbiAgICAgIG5peCA9IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKGlkKVxuICAgIH0gZWxzZSBpZiAoaWQgPT09IHRoaXMucm9vdCB8fFxuICAgICAgICByb290ID09PSBpZCB8fFxuICAgICAgICAodGhpcy5pZHNbaWRdLmNoaWxkcmVuICYmXG4gICAgICAgIHRoaXMuaWRzW2lkXS5jaGlsZHJlbi5sZW5ndGggJiZcbiAgICAgICAgIXRoaXMuaWRzW2lkXS5jb2xsYXBzZWQpKSB7XG4gICAgICBwaWQgPSBpZFxuICAgICAgbml4ID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQgPSB0aGlzLmlkc1twaWRdXG4gICAgICBuaXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihpZCkgKyAxXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBwaWQ6IHBpZCxcbiAgICAgIGluZGV4OiBuaXhcbiAgICB9XG4gIH0sXG4gIHNhbWVQbGFjZTogZnVuY3Rpb24gKGlkLCBwbGFjZSkge1xuICAgIHZhciBwaWQgPSB0aGlzLmlkc1tpZF0ucGFyZW50XG4gICAgaWYgKCFwaWQgfHwgcGlkICE9PSBwbGFjZS5waWQpIHJldHVybiBmYWxzZVxuICAgIHZhciBwYXJlbnQgPSB0aGlzLmlkc1twaWRdXG4gICAgICAsIGl4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YoaWQpXG4gICAgcmV0dXJuIGl4ID09PSBwbGFjZS5peFxuICB9LFxuICBmaW5kQ29sbGFwc2VyOiBmdW5jdGlvbiAoaWQpIHtcbiAgICBpZiAoKCF0aGlzLmlkc1tpZF0uY2hpbGRyZW4gfHxcbiAgICAgICAgICF0aGlzLmlkc1tpZF0uY2hpbGRyZW4ubGVuZ3RoIHx8XG4gICAgICAgICB0aGlzLmlkc1tpZF0uY29sbGFwc2VkKSAmJlxuICAgICAgICB0aGlzLmlkc1tpZF0ucGFyZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlkID0gdGhpcy5pZHNbaWRdLnBhcmVudFxuICAgIH1cbiAgICByZXR1cm4gaWRcbiAgfSxcbn1cblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIG1lcmdlOiBtZXJnZSxcbiAgbWFrZV9saXN0ZWQ6IG1ha2VfbGlzdGVkXG59XG5cbmZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgdmFyIGMgPSB7fVxuICAgICwgbmFtZVxuICBmb3IgKG5hbWUgaW4gYSkge1xuICAgIGNbbmFtZV0gPSBhW25hbWVdXG4gIH1cbiAgZm9yIChuYW1lIGluIGIpIHtcbiAgICBjW25hbWVdID0gYltuYW1lXVxuICB9XG4gIHJldHVybiBjXG59XG5cbmZ1bmN0aW9uIGV4dGVuZChhLCBiKSB7XG4gIGZvciAodmFyIGMgaW4gYikge1xuICAgIGFbY10gPSBiW2NdXG4gIH1cbiAgcmV0dXJuIGFcbn1cblxuZnVuY3Rpb24gbG9hZChkYiwgdHJlZSkge1xuICB2YXIgcmVzID0gbWFrZV9saXN0ZWQodHJlZSwgdW5kZWZpbmVkLCB0cnVlKVxuICBkYi5zYXZlKCdyb290Jywge2lkOiByZXMuaWR9KVxuICBmb3IgKHZhciBpPTA7IGk8cmVzLnRyZWUubGVuZ3RoOyBpKyspIHtcbiAgICBkYi5zYXZlKCdub2RlJywgcmVzLnRyZWVbaV0pXG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZV9saXN0ZWQoZGF0YSwgbmV4dGlkLCBjb2xsYXBzZSkge1xuICB2YXIgaWRzID0ge31cbiAgICAsIGNoaWxkcmVuID0gW11cbiAgICAsIG5kYXRhID0ge31cbiAgICAsIHJlc1xuICAgICwgaVxuICBpZiAodW5kZWZpbmVkID09PSBuZXh0aWQpIG5leHRpZCA9IDEwMFxuXG4gIGlmIChkYXRhLmNoaWxkcmVuKSB7XG4gICAgZm9yIChpPTA7IGk8ZGF0YS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzID0gbWFrZV9saXN0ZWQoZGF0YS5jaGlsZHJlbltpXSwgbmV4dGlkLCBjb2xsYXBzZSlcbiAgICAgIGZvciAodmFyIGlkIGluIHJlcy50cmVlKSB7XG4gICAgICAgIGlkc1tpZF0gPSByZXMudHJlZVtpZF1cbiAgICAgICAgaWRzW2lkXS5kZXB0aCArPSAxXG4gICAgICB9XG4gICAgICBjaGlsZHJlbi5wdXNoKHJlcy5pZClcbiAgICAgIG5leHRpZCA9IHJlcy5pZCArIDFcbiAgICB9XG4gICAgLy8gZGVsZXRlIGRhdGEuY2hpbGRyZW5cbiAgfVxuICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICBpZiAobmFtZSA9PT0gJ2NoaWxkcmVuJykgY29udGludWU7XG4gICAgbmRhdGFbbmFtZV0gPSBkYXRhW25hbWVdXG4gIH1cbiAgbmRhdGEuZG9uZSA9IGZhbHNlXG4gIHZhciB0aGVpZCA9IGRhdGEuaWQgfHwgbmV4dGlkXG4gIGlkc1t0aGVpZF0gPSB7XG4gICAgaWQ6IHRoZWlkLFxuICAgIGRhdGE6IG5kYXRhLFxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICBjb2xsYXBzZWQ6ICEhY29sbGFwc2UsXG4gICAgZGVwdGg6IDBcbiAgfVxuICBmb3IgKGk9MDsgaTxjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGlkc1tjaGlsZHJlbltpXV0ucGFyZW50ID0gdGhlaWQ7XG4gIH1cbiAgcmV0dXJuIHtpZDogdGhlaWQsIHRyZWU6IGlkc31cbn1cblxuXG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBWaWV3XG5cbmZ1bmN0aW9uIHJldmVyc2VkKGl0ZW1zKSB7XG4gIHZhciBudyA9IFtdXG4gIGZvciAodmFyIGk9aXRlbXMubGVuZ3RoOyBpPjA7IGktLSkge1xuICAgIG53LnB1c2goaXRlbXNbaSAtIDFdKVxuICB9XG4gIHJldHVybiBud1xufVxuXG52YXIgRG9tVmlld0xheWVyID0gcmVxdWlyZSgnLi9kb20tdmwnKVxuICAsIERlZmF1bHROb2RlID0gcmVxdWlyZSgnLi9kZWZhdWx0LW5vZGUnKVxuICAsIER1bmdlb25zQW5kRHJhZ29ucyA9IHJlcXVpcmUoJy4vZG5kJylcbiAgLCBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJylcbiAgLCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcblxuZnVuY3Rpb24gVmlldyhiaW5kQWN0aW9ucywgbW9kZWwsIGN0cmwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdGhpcy5tb2RlID0gJ25vcm1hbCdcbiAgdGhpcy5zZWxlY3Rpb24gPSBudWxsXG4gIHRoaXMuc2VsX2ludmVydGVkID0gZmFsc2VcbiAgdGhpcy5hY3RpdmUgPSBudWxsXG4gIHRoaXMubyA9IHV0aWwuZXh0ZW5kKHtcbiAgICBub2RlOiBEZWZhdWx0Tm9kZSxcbiAgICBWaWV3TGF5ZXI6IERvbVZpZXdMYXllcixcbiAgICBub1NlbGVjdFJvb3Q6IGZhbHNlXG4gIH0sIG9wdGlvbnMpXG4gIHRoaXMuby5rZXliaW5kaW5ncyA9IHV0aWwubWVyZ2UodGhpcy5kZWZhdWx0X2tleXMsIG9wdGlvbnMua2V5cylcbiAgdGhpcy52bCA9IG5ldyB0aGlzLm8uVmlld0xheWVyKHRoaXMubylcbiAgdGhpcy5iaW5kQWN0aW9ucyA9IGJpbmRBY3Rpb25zXG4gIHRoaXMubW9kZWwgPSBtb2RlbFxuICB0aGlzLmN0cmwgPSBjdHJsXG4gIHRoaXMuZG5kID0gbmV3IER1bmdlb25zQW5kRHJhZ29ucyh0aGlzLnZsLCBjdHJsLmFjdGlvbnMubW92ZS5iaW5kKGN0cmwpKVxuICB0aGlzLmxhenlfY2hpbGRyZW4gPSB7fVxuXG4gIHRoaXMubmV3Tm9kZSA9IG51bGxcbiAgdGhpcy5hdHRhY2hMaXN0ZW5lcnMoKVxufVxuXG5WaWV3LnByb3RvdHlwZSA9IHtcbiAgcmViYXNlOiBmdW5jdGlvbiAobmV3cm9vdCwgdHJpZ2dlcikge1xuICAgIHRoaXMudmwuY2xlYXIoKVxuICAgIHZhciByb290ID0gdGhpcy52bC5yb290XG4gICAgdGhpcy5pbml0aWFsaXplKG5ld3Jvb3QpXG4gICAgdGhpcy52bC5yZWJhc2Uocm9vdClcbiAgICB0aGlzLmN0cmwudHJpZ2dlcigncmViYXNlJywgbmV3cm9vdClcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKHJvb3QpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMubW9kZWwuaWRzW3Jvb3RdXG4gICAgICAsIHJvb3ROb2RlID0gdGhpcy52bC5tYWtlUm9vdChub2RlLCB0aGlzLmJpbmRBY3Rpb25zKHJvb3QpKVxuICAgIHRoaXMuYWN0aXZlID0gbnVsbFxuICAgIHRoaXMuc2VsZWN0aW9uID0gbnVsbFxuICAgIHRoaXMubGF6eV9jaGlsZHJlbiA9IHt9XG4gICAgdGhpcy5yb290ID0gcm9vdFxuICAgIHRoaXMucG9wdWxhdGVDaGlsZHJlbihyb290KVxuICAgIGlmICghbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHRoaXMuYWRkTmV3KHRoaXMucm9vdCwgMClcbiAgICB9XG4gICAgdGhpcy5zZWxlY3RTb21ldGhpbmcoKVxuICAgIHJldHVybiByb290Tm9kZVxuICB9LFxuICBzdGFydE1vdmluZzogZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLnZsLmRyb3BUYXJnZXRzKHRoaXMucm9vdCwgdGhpcy5tb2RlbCwgaWQsIHRydWUpXG4gICAgdGhpcy5kbmQuc3RhcnRNb3ZpbmcodGFyZ2V0cywgaWQpXG4gIH0sXG4gIGFkZE5ldzogZnVuY3Rpb24gKHBpZCwgaW5kZXgpIHtcbiAgICB0aGlzLm5ld05vZGUgPSB7XG4gICAgICBwaWQ6IHBpZCxcbiAgICAgIGluZGV4OiBpbmRleFxuICAgIH1cbiAgICB2YXIgYmVmb3JlID0gdGhpcy5tb2RlbC5nZXRCZWZvcmUocGlkLCBpbmRleC0xKVxuICAgIHRoaXMudmwuYWRkTmV3KHtcbiAgICAgIGlkOiAnbmV3JyxcbiAgICAgIGRhdGE6IHtuYW1lOiAnJ30sXG4gICAgICBwYXJlbnQ6IHBpZFxuICAgIH0sIHRoaXMuYmluZEFjdGlvbnMoJ25ldycpLCBiZWZvcmUpXG4gIH0sXG4gIHJlbW92ZU5ldzogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5uZXdOb2RlKSByZXR1cm4gZmFsc2VcbiAgICB2YXIgbncgPSB0aGlzLm5ld05vZGVcbiAgICAgICwgbGFzdGNoaWxkID0gIXRoaXMubW9kZWwuaWRzW253LnBpZF0uY2hpbGRyZW4ubGVuZ3RoXG4gICAgdGhpcy52bC5yZW1vdmUoJ25ldycsIG53LnBpZCwgbGFzdGNoaWxkKVxuICAgIHRoaXMubmV3Tm9kZSA9IG51bGxcbiAgICByZXR1cm4gbndcbiAgfSxcbiAgc2VsZWN0U29tZXRoaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNoaWxkXG4gICAgaWYgKCF0aGlzLm1vZGVsLmlkc1t0aGlzLnJvb3RdLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgY2hpbGQgPSAnbmV3J1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZCA9IHRoaXMubW9kZWwuaWRzW3RoaXMucm9vdF0uY2hpbGRyZW5bMF1cbiAgICB9XG4gICAgdGhpcy5nb1RvKGNoaWxkKVxuICB9LFxuICBwb3B1bGF0ZUNoaWxkcmVuOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMubW9kZWwuaWRzW2lkXVxuICAgIGlmIChub2RlLmNvbGxhcHNlZCAmJiBpZCAhPT0gdGhpcy5yb290KSB7XG4gICAgICB0aGlzLmxhenlfY2hpbGRyZW5baWRdID0gdHJ1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMubGF6eV9jaGlsZHJlbltpZF0gPSBmYWxzZVxuICAgIGlmICghbm9kZS5jaGlsZHJlbiB8fCAhbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHJldHVyblxuICAgIGZvciAodmFyIGk9MDsgaTxub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmFkZCh0aGlzLm1vZGVsLmlkc1tub2RlLmNoaWxkcmVuW2ldXSwgZmFsc2UsIHRydWUpXG4gICAgICB0aGlzLnBvcHVsYXRlQ2hpbGRyZW4obm9kZS5jaGlsZHJlbltpXSlcbiAgICB9XG4gIH0sXG4gIGdvVG86IGZ1bmN0aW9uIChpZCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICdpbnNlcnQnKSB7XG4gICAgICB0aGlzLnN0YXJ0RWRpdGluZyhpZClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRBY3RpdmUoaWQpXG4gICAgfVxuICB9LFxuXG4gIGRlZmF1bHRfa2V5czoge1xuICAgICdjdXQnOiAnY3RybCt4LCBkZWxldGUsIGQgZCcsXG4gICAgJ2NvcHknOiAnY3RybCtjLCB5IHknLFxuICAgICdwYXN0ZSc6ICdwLCBjdHJsK3YnLFxuICAgICdwYXN0ZSBhYm92ZSc6ICdzaGlmdCtwLCBjdHJsK3NoaWZ0K3YnLFxuICAgICd2aXN1YWwgbW9kZSc6ICd2LCBzaGlmdCt2JyxcblxuICAgICdlZGl0JzogJ3JldHVybiwgYSwgc2hpZnQrYSwgZjInLFxuICAgICdlZGl0IHN0YXJ0JzogJ2ksIHNoaWZ0K2knLFxuICAgICdmaXJzdCBzaWJsaW5nJzogJ3NoaWZ0K1snLFxuICAgICdsYXN0IHNpYmxpbmcnOiAnc2hpZnQrXScsXG4gICAgJ21vdmUgdG8gZmlyc3Qgc2libGluZyc6ICdzaGlmdCthbHQrWycsXG4gICAgJ21vdmUgdG8gbGFzdCBzaWJsaW5nJzogJ3NoaWZ0K2FsdCtdJyxcbiAgICAnbmV3IGFmdGVyJzogJ28nLFxuICAgICduZXcgYmVmb3JlJzogJ3NoaWZ0K28nLFxuICAgICdqdW1wIHRvIHRvcCc6ICdnIGcnLFxuICAgICdqdW1wIHRvIGJvdHRvbSc6ICdzaGlmdCtnJyxcbiAgICAndXAnOiAndXAsIGsnLFxuICAgICdkb3duJzogJ2Rvd24sIGonLFxuICAgICdsZWZ0JzogJ2xlZnQsIGgnLFxuICAgICdyaWdodCc6ICdyaWdodCwgbCcsXG4gICAgJ25leHQgc2libGluZyc6ICdhbHQraiwgYWx0K2Rvd24nLFxuICAgICdwcmV2IHNpYmxpbmcnOiAnYWx0K2ssIGFsdCt1cCcsXG4gICAgJ3RvZ2dsZSBjb2xsYXBzZSc6ICd6JyxcbiAgICAnY29sbGFwc2UnOiAnYWx0K2gsIGFsdCtsZWZ0JyxcbiAgICAndW5jb2xsYXBzZSc6ICdhbHQrbCwgYWx0K3JpZ2h0JyxcbiAgICAnaW5kZW50JzogJ3RhYiwgc2hpZnQrYWx0K2wsIHNoaWZ0K2FsdCtyaWdodCcsXG4gICAgJ2RlZGVudCc6ICdzaGlmdCt0YWIsIHNoaWZ0K2FsdCtoLCBzaGlmdCthbHQrbGVmdCcsXG4gICAgJ21vdmUgZG93bic6ICdzaGlmdCthbHQraiwgc2hpZnQrYWx0K2Rvd24nLFxuICAgICdtb3ZlIHVwJzogJ3NoaWZ0K2FsdCtrLCBzaGlmdCthbHQrdXAnLFxuICAgICd1bmRvJzogJ2N0cmwreiwgdScsXG4gICAgJ3JlZG8nOiAnY3RybCtzaGlmdCt6LCBzaGlmdCtyJyxcbiAgfSxcblxuICBhY3Rpb25zOiB7XG4gICAgJ2N1dCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gbnVsbCkgcmV0dXJuXG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5jdXQodGhpcy5hY3RpdmUpXG4gICAgfSxcbiAgICAnY29weSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gbnVsbCkgcmV0dXJuXG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5jb3B5KHRoaXMuYWN0aXZlKVxuICAgIH0sXG4gICAgJ3Bhc3RlJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSByZXR1cm5cbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLnBhc3RlKHRoaXMuYWN0aXZlKVxuICAgIH0sXG4gICAgJ3Bhc3RlIGFib3ZlJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSByZXR1cm5cbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLnBhc3RlKHRoaXMuYWN0aXZlLCB0cnVlKVxuICAgIH0sXG4gICAgJ3Zpc3VhbCBtb2RlJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSB0aGlzLnJvb3QpIHJldHVyblxuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oW3RoaXMuYWN0aXZlXSlcbiAgICB9LFxuXG4gICAgJ3VuZG8nOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmN0cmwudW5kbygpO1xuICAgIH0sXG4gICAgJ3JlZG8nOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmN0cmwucmVkbygpO1xuICAgIH0sXG4gICAgJ2VkaXQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLnJvb3RcbiAgICAgIH1cbiAgICAgIHRoaXMudmwuYm9keSh0aGlzLmFjdGl2ZSkuc3RhcnRFZGl0aW5nKClcbiAgICB9LFxuICAgICdlZGl0IHN0YXJ0JzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5yb290XG4gICAgICB9XG4gICAgICB0aGlzLnZsLmJvZHkodGhpcy5hY3RpdmUpLnN0YXJ0RWRpdGluZyh0cnVlKVxuICAgIH0sXG4gICAgLy8gbmF2XG4gICAgJ2ZpcnN0IHNpYmxpbmcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gJ25ldycpIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB2YXIgZmlyc3QgPSB0aGlzLm1vZGVsLmZpcnN0U2libGluZyh0aGlzLmFjdGl2ZSlcbiAgICAgIGlmICh1bmRlZmluZWQgPT09IGZpcnN0KSByZXR1cm5cbiAgICAgIHRoaXMuc2V0QWN0aXZlKGZpcnN0KVxuICAgIH0sXG4gICAgJ2xhc3Qgc2libGluZyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmUodGhpcy5yb290KVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSAnbmV3JykgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIHZhciBsYXN0ID0gdGhpcy5tb2RlbC5sYXN0U2libGluZyh0aGlzLmFjdGl2ZSlcbiAgICAgIGlmICh1bmRlZmluZWQgPT09IGxhc3QpIHJldHVyblxuICAgICAgdGhpcy5zZXRBY3RpdmUobGFzdClcbiAgICB9LFxuICAgICdqdW1wIHRvIHRvcCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICB9LFxuICAgICdqdW1wIHRvIGJvdHRvbSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0QWN0aXZlKHRoaXMubW9kZWwubGFzdE9wZW4odGhpcy5yb290KSlcbiAgICAgIGNvbnNvbGUubG9nKCdib3R0b20nKVxuICAgICAgLy8gcGFzc1xuICAgIH0sXG4gICAgJ3VwJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gJ25ldycpIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICAgIHZhciB0b3AgPSB0aGlzLmFjdGl2ZVxuICAgICAgICAgICwgYWJvdmUgPSB0aGlzLm1vZGVsLmlkQWJvdmUodG9wKVxuICAgICAgICBpZiAoYWJvdmUgPT09IHVuZGVmaW5lZCkgYWJvdmUgPSB0b3BcbiAgICAgICAgaWYgKGFib3ZlID09PSB0aGlzLnJvb3QgJiYgdGhpcy5vLm5vU2VsZWN0Um9vdCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlKGFib3ZlKVxuICAgICAgfVxuICAgIH0sXG4gICAgJ2Rvd24nOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmUodGhpcy5yb290KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSAnbmV3JykgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gdGhpcy5yb290ICYmXG4gICAgICAgICAgICAhdGhpcy5tb2RlbC5pZHNbdGhpcy5yb290XS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmUoJ25ldycpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRvcCA9IHRoaXMuYWN0aXZlXG4gICAgICAgICAgLCBhYm92ZSA9IHRoaXMubW9kZWwuaWRCZWxvdyh0b3AsIHRoaXMucm9vdClcbiAgICAgICAgaWYgKGFib3ZlID09PSB1bmRlZmluZWQpIGFib3ZlID0gdG9wXG4gICAgICAgIHRoaXMuc2V0QWN0aXZlKGFib3ZlKVxuICAgICAgfVxuICAgIH0sXG4gICAgJ2xlZnQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gJ25ldycpIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB2YXIgbGVmdCA9IHRoaXMubW9kZWwuZ2V0UGFyZW50KHRoaXMuYWN0aXZlKVxuICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gbGVmdCkgcmV0dXJuXG4gICAgICB0aGlzLnNldEFjdGl2ZShsZWZ0KVxuICAgIH0sXG4gICAgJ3JpZ2h0JzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09ICduZXcnKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gdGhpcy5yb290ICYmXG4gICAgICAgICAgIXRoaXMubW9kZWwuaWRzW3RoaXMucm9vdF0uY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSgnbmV3JylcbiAgICAgIH1cbiAgICAgIHZhciByaWdodCA9IHRoaXMubW9kZWwuZ2V0Q2hpbGQodGhpcy5hY3RpdmUpXG4gICAgICBpZiAodGhpcy5tb2RlbC5pc0NvbGxhcHNlZCh0aGlzLmFjdGl2ZSkpIHJldHVyblxuICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gcmlnaHQpIHJldHVyblxuICAgICAgdGhpcy5zZXRBY3RpdmUocmlnaHQpXG4gICAgfSxcbiAgICAnbmV4dCBzaWJsaW5nJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09ICduZXcnKSByZXR1cm5cbiAgICAgIHZhciBzaWIgPSB0aGlzLm1vZGVsLm5leHRTaWJsaW5nKHRoaXMuYWN0aXZlKVxuICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gc2liKSByZXR1cm5cbiAgICAgIHRoaXMuc2V0QWN0aXZlKHNpYilcbiAgICB9LFxuICAgICdwcmV2IHNpYmxpbmcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gJ25ldycpIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB2YXIgc2liID0gdGhpcy5tb2RlbC5wcmV2U2libGluZyh0aGlzLmFjdGl2ZSlcbiAgICAgIGlmICh1bmRlZmluZWQgPT09IHNpYikgcmV0dXJuXG4gICAgICB0aGlzLnNldEFjdGl2ZShzaWIpXG4gICAgfSxcbiAgICAnbW92ZSB0byBmaXJzdCBzaWJsaW5nJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09ICduZXcnKSByZXR1cm5cbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLm1vdmVUb1RvcCh0aGlzLmFjdGl2ZSlcbiAgICB9LFxuICAgICdtb3ZlIHRvIGxhc3Qgc2libGluZyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmUodGhpcy5yb290KVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSAnbmV3JykgcmV0dXJuXG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5tb3ZlVG9Cb3R0b20odGhpcy5hY3RpdmUpXG4gICAgfSxcbiAgICAnbmV3IGJlZm9yZSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSA9PT0gbnVsbCkgcmV0dXJuXG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09ICduZXcnKSByZXR1cm4gdGhpcy5zdGFydEVkaXRpbmcoKVxuICAgICAgdGhpcy5jdHJsLmFkZEJlZm9yZSh0aGlzLmFjdGl2ZSlcbiAgICAgIHRoaXMuc3RhcnRFZGl0aW5nKClcbiAgICB9LFxuICAgICduZXcgYWZ0ZXInOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHJldHVyblxuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSAnbmV3JykgcmV0dXJuIHRoaXMuc3RhcnRFZGl0aW5nKClcbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLmFkZEFmdGVyKHRoaXMuYWN0aXZlKVxuICAgICAgdGhpcy5zdGFydEVkaXRpbmcoKVxuICAgIH0sXG4gICAgLy8gbW92ZXohXG4gICAgJ3RvZ2dsZSBjb2xsYXBzZSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLnRvZ2dsZUNvbGxhcHNlKHRoaXMuYWN0aXZlKVxuICAgIH0sXG4gICAgJ2NvbGxhcHNlJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy50b2dnbGVDb2xsYXBzZSh0aGlzLmFjdGl2ZSwgdHJ1ZSlcbiAgICB9LFxuICAgICd1bmNvbGxhcHNlJzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy50b2dnbGVDb2xsYXBzZSh0aGlzLmFjdGl2ZSwgZmFsc2UpXG4gICAgfSxcbiAgICAnaW5kZW50JzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5tb3ZlUmlnaHQodGhpcy5hY3RpdmUpXG4gICAgfSxcbiAgICAnZGVkZW50JzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgICB9XG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5tb3ZlTGVmdCh0aGlzLmFjdGl2ZSlcbiAgICB9LFxuICAgICdtb3ZlIGRvd24nOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIH1cbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLm1vdmVEb3duKHRoaXMuYWN0aXZlKVxuICAgIH0sXG4gICAgJ21vdmUgdXAnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKHRoaXMucm9vdClcbiAgICAgIH1cbiAgICAgIHRoaXMuY3RybC5hY3Rpb25zLm1vdmVVcCh0aGlzLmFjdGl2ZSlcbiAgICB9XG4gIH0sXG5cbiAgdmlzdWFsOiB7XG4gICAgLy8gbW92ZW1lbnRcbiAgICAnaywgdXAnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcHJldiA9IHRoaXMubW9kZWwucHJldlNpYmxpbmcodGhpcy5hY3RpdmUsIHRydWUpXG4gICAgICBpZiAoIXByZXYpIHJldHVyblxuICAgICAgdGhpcy5hZGRUb1NlbGVjdGlvbihwcmV2LCB0cnVlKVxuICAgIH0sXG4gICAgJ2osIGRvd24nOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbmV4dCA9IHRoaXMubW9kZWwubmV4dFNpYmxpbmcodGhpcy5hY3RpdmUsIHRydWUpXG4gICAgICBpZiAoIW5leHQpIHJldHVyblxuICAgICAgdGhpcy5hZGRUb1NlbGVjdGlvbihuZXh0LCBmYWxzZSlcbiAgICB9LFxuICAgICdzaGlmdCtnJzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG4gPSB0aGlzLm1vZGVsLmlkc1t0aGlzLnNlbGVjdGlvblswXV1cbiAgICAgICAgLCBjaCA9IHRoaXMubW9kZWwuaWRzW24ucGFyZW50XS5jaGlsZHJlblxuICAgICAgICAsIGl4ID0gY2guaW5kZXhPZih0aGlzLnNlbGVjdGlvblswXSlcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKGNoLnNsaWNlKGl4KSlcbiAgICAgIHRoaXMuc2VsX2ludmVydGVkID0gZmFsc2VcbiAgICAgIHRoaXMuc2V0QWN0aXZlKGNoW2NoLmxlbmd0aC0xXSlcbiAgICB9LFxuICAgICdnIGcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbiA9IHRoaXMubW9kZWwuaWRzW3RoaXMuc2VsZWN0aW9uWzBdXVxuICAgICAgICAsIGNoID0gdGhpcy5tb2RlbC5pZHNbbi5wYXJlbnRdLmNoaWxkcmVuXG4gICAgICAgICwgaXggPSBjaC5pbmRleE9mKHRoaXMuc2VsZWN0aW9uWzBdKVxuICAgICAgICAsIGl0ZW1zID0gW11cbiAgICAgIGZvciAodmFyIGk9MDsgaTw9aXg7IGkrKykge1xuICAgICAgICBpdGVtcy51bnNoaWZ0KGNoW2ldKVxuICAgICAgfVxuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oaXRlbXMpXG4gICAgICB0aGlzLnNlbF9pbnZlcnRlZCA9IGl0ZW1zLmxlbmd0aCA+IDFcbiAgICAgIHRoaXMuc2V0QWN0aXZlKGNoWzBdKVxuICAgIH0sXG4gICAgJ3YsIHNoaWZ0K3YsIGVzY2FwZSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc3RvcFNlbGVjdGluZygpXG4gICAgfSxcbiAgICAnaSwgYSwgc2hpZnQrYSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc3RhcnRFZGl0aW5nKHRoaXMuYWN0aXZlKVxuICAgIH0sXG4gICAgJ3NoaWZ0K2knOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnN0YXJ0RWRpdGluZyh0aGlzLmFjdGl2ZSwgdHJ1ZSlcbiAgICB9LFxuXG4gICAgLy8gZWRpdG5lc3NcbiAgICAnZCwgc2hpZnQrZCwgY3RybCt4JzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGl0ZW1zID0gdGhpcy5zZWxlY3Rpb24uc2xpY2UoKVxuICAgICAgaWYgKHRoaXMuc2VsX2ludmVydGVkKSB7XG4gICAgICAgIGl0ZW1zID0gcmV2ZXJzZWQoaXRlbXMpXG4gICAgICB9XG4gICAgICB0aGlzLmN0cmwuYWN0aW9ucy5jdXQoaXRlbXMpXG4gICAgICB0aGlzLnN0b3BTZWxlY3RpbmcoKVxuICAgIH0sXG4gICAgJ3ksIHNoaWZ0K3ksIGN0cmwrYyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpdGVtcyA9IHRoaXMuc2VsZWN0aW9uLnNsaWNlKClcbiAgICAgIGlmICh0aGlzLnNlbF9pbnZlcnRlZCkge1xuICAgICAgICBpdGVtcyA9IHJldmVyc2VkKGl0ZW1zKVxuICAgICAgfVxuICAgICAgdGhpcy5jdHJsLmFjdGlvbnMuY29weShpdGVtcylcbiAgICAgIHRoaXMuc3RvcFNlbGVjdGluZygpXG4gICAgfSxcbiAgICAndSwgY3RybCt6JzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zdG9wU2VsZWN0aW5nKClcbiAgICAgIHRoaXMuY3RybC51bmRvKClcbiAgICB9LFxuICAgICdzaGlmdCtyLCBjdHJsK3NoaWZ0K3onOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnN0b3BTZWxlY3RpbmcoKVxuICAgICAgdGhpcy5jdHJsLnJlZG8oKVxuICAgIH1cbiAgfSxcblxuICBleHRyYV9hY3Rpb25zOiB7fSxcblxuICBrZXlIYW5kbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5vcm1hbCA9IHt9XG4gICAgICAsIG5hbWVcbiAgICBmb3IgKG5hbWUgaW4gdGhpcy5vLmtleWJpbmRpbmdzKSB7XG4gICAgICBpZiAoIXRoaXMuYWN0aW9uc1tuYW1lXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29uZmlndXJhdGlvbiEgVW5rbm93biBhY3Rpb246ICcgKyBuYW1lKVxuICAgICAgfVxuICAgICAgbm9ybWFsW3RoaXMuby5rZXliaW5kaW5nc1tuYW1lXV0gPSB0aGlzLmFjdGlvbnNbbmFtZV1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5leHRyYV9hY3Rpb25zKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gdGhpcy5leHRyYV9hY3Rpb25zKSB7XG4gICAgICAgIGlmICghbm9ybWFsW25hbWVdKSB7XG4gICAgICAgICAgbm9ybWFsW3RoaXMuZXh0cmFfYWN0aW9uc1tuYW1lXS5iaW5kaW5nXSA9IHRoaXMuZXh0cmFfYWN0aW9uc1tuYW1lXS5hY3Rpb25cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYW5kbGVycyA9IHtcbiAgICAgICdpbnNlcnQnOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICdub3JtYWwnOiBrZXlzKG5vcm1hbCksXG4gICAgICAndmlzdWFsJzoga2V5cyh0aGlzLnZpc3VhbClcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGhhbmRsZXJzW3RoaXMubW9kZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIGF0dGFjaExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXlkb3duID0gdGhpcy5rZXlIYW5kbGVyKClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAnaW5zZXJ0JykgcmV0dXJuXG4gICAgICBrZXlkb3duLmNhbGwodGhpcywgZSlcbiAgICB9LmJpbmQodGhpcykpXG4gIH0sXG5cbiAgYWRkVHJlZTogZnVuY3Rpb24gKG5vZGUsIGJlZm9yZSkge1xuICAgIGlmICghdGhpcy52bC5ib2R5KG5vZGUucGFyZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMucmViYXNlKG5vZGUucGFyZW50LCB0cnVlKVxuICAgIH1cbiAgICB0aGlzLmFkZChub2RlLCBiZWZvcmUpXG4gICAgaWYgKCFub2RlLmNoaWxkcmVuLmxlbmd0aCkgcmV0dXJuXG4gICAgZm9yICh2YXIgaT0wOyBpPG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuYWRkVHJlZSh0aGlzLm1vZGVsLmlkc1tub2RlLmNoaWxkcmVuW2ldXSwgZmFsc2UpXG4gICAgfVxuICB9LFxuXG4gIC8vIG9wZXJhdGlvbnNcbiAgYWRkOiBmdW5jdGlvbiAobm9kZSwgYmVmb3JlLCBkb250Zm9jdXMpIHtcbiAgICB2YXIgZWQgPSB0aGlzLm1vZGUgPT09ICdpbnNlcnQnXG4gICAgICAsIGNoaWxkcmVuID0gISFub2RlLmNoaWxkcmVuLmxlbmd0aFxuICAgIGlmICghdGhpcy52bC5ib2R5KG5vZGUucGFyZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMucmViYXNlKG5vZGUucGFyZW50LCB0cnVlKVxuICAgIH1cbiAgICB0aGlzLnZsLmFkZE5ldyhub2RlLCB0aGlzLmJpbmRBY3Rpb25zKG5vZGUuaWQpLCBiZWZvcmUsIGNoaWxkcmVuKVxuICAgIGlmICghZG9udGZvY3VzKSB7XG4gICAgICBpZiAoZWQpIHtcbiAgICAgICAgdGhpcy52bC5ib2R5KG5vZGUuaWQpLnN0YXJ0RWRpdGluZygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZShub2RlLmlkKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgcGlkID0gdGhpcy5tb2RlbC5pZHNbaWRdLnBhcmVudFxuICAgICAgLCBwYXJlbnQgPSB0aGlzLm1vZGVsLmlkc1twaWRdXG4gICAgaWYgKCF0aGlzLnZsLmJvZHkoaWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWJhc2UocGlkLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaWQgPT09IHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLnNldEFjdGl2ZSh0aGlzLnJvb3QpXG4gICAgfVxuICAgIHRoaXMudmwucmVtb3ZlKGlkLCBwaWQsIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAxKVxuICAgIGlmIChwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIHBpZCA9PT0gdGhpcy5yb290KSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRkTmV3KHBpZCwgMClcbiAgICAgIH0uYmluZCh0aGlzKSwwKVxuICAgIH1cbiAgfSxcbiAgc2V0QXR0cjogZnVuY3Rpb24gKGlkLCBhdHRyLCB2YWx1ZSkge1xuICAgIGlmICghdGhpcy52bC5ib2R5KGlkKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmViYXNlKGlkLCB0cnVlKVxuICAgIH1cbiAgICB0aGlzLnZsLmJvZHkoaWQpLnNldEF0dHIoYXR0ciwgdmFsdWUpXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ2luc2VydCcpIHtcbiAgICAgIHRoaXMudmwuYm9keShpZCkuc3RhcnRFZGl0aW5nKClcbiAgICB9XG4gIH0sXG4gIHNldERhdGE6IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xuICAgIHRoaXMudmwuYm9keShpZCkuc2V0RGF0YShkYXRhKVxuICAgIGlmICh0aGlzLm1vZGUgPT09ICdpbnNlcnQnKSB7XG4gICAgICB0aGlzLnZsLmJvZHkoaWQpLnN0YXJ0RWRpdGluZygpXG4gICAgfVxuICB9LFxuICBhcHBlbmRUZXh0OiBmdW5jdGlvbiAoaWQsIHRleHQpIHtcbiAgICB0aGlzLnZsLmJvZHkoaWQpLmFkZEVkaXRUZXh0KHRleHQpXG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIChpZCwgcGlkLCBiZWZvcmUsIHBwaWQsIGxhc3RjaGlsZCkge1xuICAgIGlmICghdGhpcy52bC5ib2R5KGlkKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmViYXNlKHRoaXMubW9kZWwuY29tbW9uUGFyZW50KHBpZCwgcHBpZCksIHRydWUpXG4gICAgfVxuICAgIHZhciBlZCA9IHRoaXMubW9kZSA9PT0gJ2luc2VydCdcbiAgICB0aGlzLnZsLm1vdmUoaWQsIHBpZCwgYmVmb3JlLCBwcGlkLCBsYXN0Y2hpbGQpXG4gICAgaWYgKGVkKSB0aGlzLnN0YXJ0RWRpdGluZyhpZClcbiAgfSxcbiAgc3RhcnRFZGl0aW5nOiBmdW5jdGlvbiAoaWQsIGZyb21TdGFydCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZCA9IHRoaXMuYWN0aXZlICE9PSBudWxsID8gdGhpcy5hY3RpdmUgOiB0aGlzLnJvb3RcbiAgICB9XG4gICAgaWYgKGlkID09PSB0aGlzLnJvb3QgJiYgdGhpcy5vLm5vU2VsZWN0Um9vdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBib2R5ID0gdGhpcy52bC5ib2R5KGlkKVxuICAgIGlmICghYm9keSkgcmV0dXJuXG4gICAgYm9keS5zdGFydEVkaXRpbmcoZnJvbVN0YXJ0KVxuICB9LFxuICBzZXRFZGl0aW5nOiBmdW5jdGlvbiAoaWQpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJykge1xuICAgICAgdGhpcy5zdG9wU2VsZWN0aW5nKClcbiAgICB9XG4gICAgdGhpcy5tb2RlID0gJ2luc2VydCdcbiAgICB0aGlzLnNldEFjdGl2ZShpZClcbiAgfSxcbiAgZG9uZUVkaXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm1vZGUgPSAnbm9ybWFsJ1xuICB9LFxuICBzZXRBY3RpdmU6IGZ1bmN0aW9uIChpZCkge1xuICAgIGlmIChpZCA9PT0gdGhpcy5hY3RpdmUpIHJldHVyblxuICAgIGlmICh0aGlzLmFjdGl2ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy52bC5jbGVhckFjdGl2ZSh0aGlzLmFjdGl2ZSlcbiAgICB9XG4gICAgaWYgKCF0aGlzLnZsLmRvbVtpZF0pIHtcbiAgICAgIGlkID0gdGhpcy5yb290XG4gICAgfVxuICAgIHRoaXMuYWN0aXZlID0gaWRcbiAgICB0aGlzLnZsLnNob3dBY3RpdmUoaWQpXG4gIH0sXG4gIGFkZFRvU2VsZWN0aW9uOiBmdW5jdGlvbiAoaWQsIGludmVydCkge1xuICAgIHZhciBpeCA9IHRoaXMuc2VsZWN0aW9uLmluZGV4T2YoaWQpXG4gICAgaWYgKGl4ID09PSAtMSkge1xuICAgICAgdGhpcy5zZWxlY3Rpb24ucHVzaChpZClcbiAgICAgIHRoaXMudmwuc2hvd1NlbGVjdGlvbihbaWRdKVxuICAgICAgdGhpcy5zZWxfaW52ZXJ0ZWQgPSBpbnZlcnRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52bC5jbGVhclNlbGVjdGlvbih0aGlzLnNlbGVjdGlvbi5zbGljZShpeCArIDEpKVxuICAgICAgdGhpcy5zZWxlY3Rpb24gPSB0aGlzLnNlbGVjdGlvbi5zbGljZSgwLCBpeCArIDEpXG4gICAgICBpZiAodGhpcy5zZWxlY3Rpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHRoaXMuc2VsX2ludmVydGVkID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRBY3RpdmUoaWQpXG4gICAgY29uc29sZS5sb2codGhpcy5zZWxfaW52ZXJ0ZWQpXG4gIH0sXG4gIHNldFNlbGVjdGlvbjogZnVuY3Rpb24gKHNlbCkge1xuICAgIHRoaXMubW9kZSA9ICd2aXN1YWwnXG4gICAgdGhpcy5zZWxfaW52ZXJ0ZWQgPSBmYWxzZVxuICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xuICAgICAgdGhpcy52bC5jbGVhclNlbGVjdGlvbih0aGlzLnNlbGVjdGlvbilcbiAgICB9XG4gICAgdGhpcy5zZWxlY3Rpb24gPSBzZWxcbiAgICB0aGlzLnZsLnNob3dTZWxlY3Rpb24oc2VsKVxuICB9LFxuICBzdG9wU2VsZWN0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnZsLmNsZWFyU2VsZWN0aW9uKHRoaXMuc2VsZWN0aW9uKVxuICAgICAgdGhpcy5zZWxlY3Rpb24gPSBudWxsXG4gICAgfVxuICAgIHRoaXMubW9kZSA9ICdub3JtYWwnXG4gIH0sXG4gIHNldENvbGxhcHNlZDogZnVuY3Rpb24gKGlkLCB3aGF0KSB7XG4gICAgLypcbiAgICBpZiAoIXRoaXMudmwuYm9keShpZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlYmFzZSh0aGlzLm1vZGVsLmlkc1tpZF0ucGFyZW50KVxuICAgIH1cbiAgICAqL1xuICAgIHRoaXMudmwuc2V0Q29sbGFwc2VkKGlkLCB3aGF0KVxuICAgIGlmICh3aGF0KSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAnaW5zZXJ0Jykge1xuICAgICAgICB0aGlzLnN0YXJ0RWRpdGluZyhpZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlKGlkKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5sYXp5X2NoaWxkcmVuW2lkXSkge1xuICAgICAgICB0aGlzLnBvcHVsYXRlQ2hpbGRyZW4oaWQpXG4gICAgICB9XG4gICAgfVxuICAgIC8vIFRPRE86IGV2ZW50IGxpc3RlbmVycz9cbiAgfSxcblxuICAvLyBub24tbW9kaWZ5aW5nIHN0dWZmXG4gIGdvVXA6IGZ1bmN0aW9uIChpZCkge1xuICAgIC8vIHNob3VsZCBJIGNoZWNrIHRvIHNlZSBpZiBpdCdzIG9rP1xuICAgIHZhciBhYm92ZSA9IHRoaXMubW9kZWwuaWRBYm92ZShpZClcbiAgICBpZiAoYWJvdmUgPT09IGZhbHNlKSByZXR1cm5cbiAgICBpZiAoYWJvdmUgPT09IHRoaXMucm9vdCAmJiB0aGlzLm8ubm9TZWxlY3RSb290KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy52bC5ib2R5KGFib3ZlKS5ib2R5LnN0YXJ0RWRpdGluZygpO1xuICB9LFxuICBnb0Rvd246IGZ1bmN0aW9uIChpZCwgZnJvbVN0YXJ0KSB7XG4gICAgdmFyIGJlbG93ID0gdGhpcy5tb2RlbC5pZEJlbG93KGlkLCB0aGlzLnJvb3QpXG4gICAgaWYgKGJlbG93ID09PSBmYWxzZSkgcmV0dXJuXG4gICAgdGhpcy52bC5ib2R5KGJlbG93KS5ib2R5LnN0YXJ0RWRpdGluZyhmcm9tU3RhcnQpXG4gIH0sXG59XG5cbiIsIlxuXG52YXIgZCA9IFJlYWN0LkRPTVxuICAsIGxpYiA9IHJlcXVpcmUoJy4vaW5kZXgnKVxuICAsIHV0aWwgPSByZXF1aXJlKCcuL2xpYi91dGlsJylcbiAgLCBNZW1QTCA9IHJlcXVpcmUoJy4vbGliL21lbS1wbCcpXG5cbnZhciBQTHMgPSB7XG4gICdMb2NhbCc6IHJlcXVpcmUoJy4vbGliL2xvY2FsLXBsJyksXG4gICdNZW0nOiByZXF1aXJlKCcuL2xpYi9tZW0tcGwnKSxcbiAgJ0R1bWInOiByZXF1aXJlKCcuL2xpYi9kdW1iLXBsJylcbn1cblxudmFyIE1haW5BcHAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYjogbnVsbFxuICAgIH1cbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmVhZ2U6IFtdLFxuICAgICAgbW9kZWw6IG51bGwsXG4gICAgICBsb2FkaW5nOiB0cnVlXG4gICAgfVxuICB9LFxuICBjaGFuZ2VCcmVhZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgdGhpcy5yZWZzLndmLndmLmFjdGlvbnMuY2xpY2tCdWxsZXQoaWQpXG4gIH0sXG4gIHVwZGF0ZUJyZWFkOiBmdW5jdGlvbiAobGluZWFnZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2xpbmVhZ2U6IGxpbmVhZ2V9KVxuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYiA9IHRoaXMucHJvcHMuZGJcbiAgICAgICwgdGhhdCA9IHRoaXNcbiAgICBkYi5maW5kQWxsKCdyb290JykudGhlbihmdW5jdGlvbiAocm9vdHMpIHtcbiAgICAgIGlmICghcm9vdHMubGVuZ3RoKSB7XG4gICAgICAgIC8vIGxvYWQgZGVmYXVsdFxuICAgICAgICBkYi5zYXZlKCdyb290JywgNTAsIHtpZDogNTB9KVxuICAgICAgICB2YXIgdHJlZSA9IHtcbiAgICAgICAgICA1MDoge1xuICAgICAgICAgICAgaWQ6IDUwLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IHtuYW1lOiAnSG9tZSd9LFxuICAgICAgICAgICAgZGVwdGg6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGIuc2F2ZSgnbm9kZScsIDUwLCB0cmVlWzUwXSlcbiAgICAgICAgdmFyIG1vZGVsID0gd2luZG93Lm1vZGVsID0gbmV3IGxpYi5Nb2RlbCg1MCwgdHJlZSwgZGIpXG4gICAgICAgIHJldHVybiB0aGF0LnNldFN0YXRlKHtsb2FkaW5nOiBmYWxzZSwgbW9kZWw6IG1vZGVsfSlcbiAgICAgIH1cbiAgICAgIGRiLmZpbmRBbGwoJ25vZGUnKS50aGVuKGZ1bmN0aW9uIChub2Rlcykge1xuICAgICAgICB2YXIgdHJlZSA9IHt9XG4gICAgICAgICAgLCBpZCA9IHJvb3RzWzBdLmlkXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRyZWVbbm9kZXNbaV0uaWRdID0gbm9kZXNbaV1cbiAgICAgICAgfVxuICAgICAgICB2YXIgbW9kZWwgPSB3aW5kb3cubW9kZWwgPSBuZXcgbGliLk1vZGVsKGlkLCB0cmVlLCBkYilcbiAgICAgICAgcmV0dXJuIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6IGZhbHNlLCBtb2RlbDogbW9kZWx9KVxuICAgICAgfSlcbiAgICB9KVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICByZXR1cm4gZC5kaXYoe2NsYXNzTmFtZTogJ3dvcmtmbG93bWUnfSwgJ0xvYWRpbmcuLi4nKVxuICAgIH1cbiAgICByZXR1cm4gZC5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiAnd29ya2Zsb3dtZSdcbiAgICB9LCBIaXN0b3J5KHtpdGVtczogdGhpcy5zdGF0ZS5saW5lYWdlLCBvbkNsaWNrOiB0aGlzLmNoYW5nZUJyZWFkfSksXG4gICAgICAgV29ya2Zsb3d5KHtcbiAgICAgICAgIHJlZjogJ3dmJyxcbiAgICAgICAgIG1vZGVsOiB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgICAgb25CcmVhZENydW1iOiB0aGlzLnVwZGF0ZUJyZWFkXG4gICAgICB9KVxuICAgIClcbiAgfVxufSlcblxudmFyIFdvcmtmbG93eSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLndmID0gbmV3IGxpYi5Db250cm9sbGVyKHRoaXMucHJvcHMubW9kZWwsIHtvbkJ1bGxldDogdGhpcy5wcm9wcy5vbkJyZWFkQ3J1bWJ9KVxuICAgIHRoaXMud2Yub24oJ3JlYmFzZScsIGZ1bmN0aW9uIChyb290KSB7XG4gICAgICB0aGlzLnByb3BzLm9uQnJlYWRDcnVtYih0aGlzLnByb3BzLm1vZGVsLmdldExpbmVhZ2Uocm9vdCkpXG4gICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMuZ2V0RE9NTm9kZSgpLmFwcGVuZENoaWxkKHRoaXMud2Yubm9kZSlcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGQuZGl2KClcbiAgfVxufSlcblxudmFyIEhpc3RvcnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpdGVtczogW10sXG4gICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7fVxuICAgIH1cbiAgfSxcbiAgbW91c2VEb3duOiBmdW5jdGlvbiAoaWQsIGUpIHtcbiAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVyblxuICAgIHRoaXMucHJvcHMub25DbGljayhpZClcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgcmV0dXJuIGQudWwoXG4gICAgICB7Y2xhc3NOYW1lOiAnYnJlYWRjcnVtYid9LFxuICAgICAgdGhpcy5wcm9wcy5pdGVtcy5zbGljZSgwLCAtMSkubWFwKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgIHJldHVybiBkLmxpKHtcbiAgICAgICAgICBrZXk6IGl0ZW0uaWQsXG4gICAgICAgICAgY2xhc3NOYW1lOiAnbGlzdGxlc3NfX2JyZWFkJyxcbiAgICAgICAgICBvbk1vdXNlRG93bjogdGhhdC5tb3VzZURvd24uYmluZChudWxsLCBpdGVtLmlkKSxcbiAgICAgICAgICBkYW5nZXJvdXNseVNldElubmVySFRNTDoge1xuICAgICAgICAgICAgX19odG1sOiBtYXJrZWQoaXRlbS5uYW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgKVxuICB9XG59KVxuXG5pZiAoJ3N0cmluZycgPT09IHR5cGVvZiB3aW5kb3cuUEwpIHtcbiAgd2luZG93LlBMID0gbmV3IFBMc1t3aW5kb3cuUExdKClcbn1cblxudmFyIGJhc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhhbXBsZScpXG5cblJlYWN0LnJlbmRlckNvbXBvbmVudChNYWluQXBwKHtcbiAgZGI6IHdpbmRvdy5QTCxcbiAgLy8gaWQ6IGRhdGEuaWQsXG4gIC8vIHRyZWU6IGRhdGEudHJlZVxufSksIGJhc2UpXG5cblxuIl19
