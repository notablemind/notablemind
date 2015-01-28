
var global = this

function send(name, data) {
  postMessage({name: name, data: data})
}

function cloneE(e) {
  return {
    name: e.name,
    message: e.message,
    stack: e.stack,
  }
}

var HANDLERS = {
  'eval': function (payload) {
    var res, err
    try {
      res = global.eval(payload.text)
    } catch (e) {
      err = cloneE(e)
    }
    send('eval', {id: payload.id, error: err, result: res})
  },

  'go': function (payload) {
    var fn, err

    // syntaxes
    try {
      eval('fn = ' + payload.what)
    } catch (e) {
      console.log('er!', e)
      console.log(e)
      console.log(payload)
      return send('go', {id: payload.id, error: cloneE(e)})
    }

    var args = payload.args
    payload.fns.forEach(function (i) {
      args[i] = function () {
        try {
          send('go', {
            args: [].slice.call(arguments),
            id: payload.id,
            fn: i,
          })
        } catch (e) {
          console.log('failed to send', e, [].slice.call(arguments))
          send('go', {id: payload.id, error: cloneE(e)})
        }
      }
    })

    try {
      fn.apply(null, args)
    } catch (e) {
      console.log('er!', e)
      console.log(e)
      send('go', {id: payload.id, error: cloneE(e)})
    }
  }
}

onmessage = function (evt) {
  var data = evt.data
  if (!HANDLERS[data.name]) {
    console.log('Unknown action', data)
    return
  }
  HANDLERS[data.name](data.data)
}

