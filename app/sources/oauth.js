
module.exports = authenticate

function authenticate(CONFIG, done) {
  var rand = uuid()
  firstStep(CONFIG, rand, function (err, created, params) {
    if (err) {
      created.close()
      return done(err)
    }
    secondStep(created, params, function (err, params) {
      created.close()
      done(err, params)
    })
  })
}

function firstStep(CONFIG, rand, done) {
  var url = CONFIG.authorize + '?' + params({
    client_id: CONFIG.client_id,
    scope: 'gist',
    redirect_uri: CONFIG.redirect_uri,
    state: JSON.stringify({
      client_id: CONFIG.client_id,
      rand: rand,
      oauth_proxy: CONFIG.proxy,
      redirect_uri: CONFIG.redirect_uri,
      oauth: {
        version : 2,
        auth : 'https://github.com/login/oauth/authorize',
        grant : 'https://github.com/login/oauth/access_token',
        response_type : 'code'
      }
    })
  })

  var created = window.open(url, 'Github Auth', 'width=400,height=400')
  waitForWindow(created, function (err) {
    if (err) return done(err)
    done(null, created, params(created.location.search.slice(1)))
  })
}

function secondStep(window, searchParams, done) {
  var state = JSON.parse(searchParams.state);
  searchParams.redirect_uri = state.redirect_uri;
  var path = state.oauth_proxy + "?" + params(searchParams);
  window.location.assign(path);

  waitForWindow(window, function (err) {
    if (err) return done(err)
    waitFor(20, 100, function () {
      if (window.location.hash.length < 2) return false
      done(null, params(window.location.hash.slice(1)))
      return true
    })
  })
}

// utility functions

/**
 * Expect an external window to be done sometime soon
 */
function waitForWindow(window, initial, step, done) {
  if (arguments.length === 2) {
    done = initial
    initial = 500
    step = 100
  }
  waitFor(initial, step, function () {
    if (window.closed) {
      done(new Error('User aborder auth'))
      return true
    }
    try {
      var m = window.location.search;
    } catch (e) {
      return false
    }
    done()
    return true
  })
}

// wait for something to happen
function waitFor(start, ival, done) {
  setTimeout(function () {
    if (done()) return
    var clear = setInterval(function () {
      if (done()) {
        clearInterval(clear)
      }
    }, ival)
  }, start)
}

var chrs = '0123456789abcdefghijklmnopqrtsuvwxyz'
function uuid(num) {
  num = num || 32
  var res = ''
  for (var i=0; i<num; i++) {
    res += chrs[parseInt(Math.random() * chrs.length)]
  }
  return res
}

function params(what) {
  if ('string' === typeof what) return parseParams(what)
  return Object.keys(what).map(function (name) {return name + '=' + encodeURIComponent(what[name])}).join('&');
}

function parseParams(what) {
  var obj = {}
  what.split('&').forEach(function (part) {
    var subs = part.split('=')
    obj[subs[0]] = decodeURIComponent(subs.slice(1).join('='))
  })
  return obj
}


