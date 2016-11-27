
const isHTMLCache = {}
const checkIsHTML = module.exports = (rawUrl, done) => {
  if (isHTMLCache[rawUrl] !== undefined) {
    return done(null, isHTMLCache[rawUrl])
  }
  const url = require('url').parse(rawUrl)
  const https = rawUrl.match(/^https/)
  const req = require(https ? 'https' : 'http').request({
    method: 'HEAD',
    port: https ? 443 : 80,
    host: url.host,
    path: url.path,
  }, res => {
    if (!res || !res.headers || !res.headers['content-type']) {
      isHTMLCache[rawUrl] = false
      return done(null, false)
    }
    if (res.headers['content-type'].indexOf('text/html') === -1) {
      isHTMLCache[rawUrl] = false
      return done(null, false)
    }
    isHTMLCache[rawUrl] = true
    done(null, true)
  })
  req.end()
}

