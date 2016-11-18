
const isPDFCache = {}
const checkIsPDF = module.exports = (rawUrl, done) => {
  if (isPDFCache[rawUrl] !== undefined) {
    return done(null, isPDFCache[rawUrl])
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
      isPDFCache[rawUrl] = false
      return done(null, false)
    }
    if (res.headers['content-type'].toLowerCase() !== 'application/pdf') {
      isPDFCache[rawUrl] = false
      return done(null, false)
    }
    isPDFCache[rawUrl] = true
    done(null, true)
  })
  req.end()
}

