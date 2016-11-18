
const isPDFCache = {}
const checkIsPDF = module.exports = (url, done) => {
  if (isPDFCache[url] !== undefined) {
    return done(null, isPDFCache[url])
  }
  const url = require('url').parse(this.props.url)
  const https = url.match(/^https/)
  const req = require(https ? 'https' : 'http').request({
    method: 'HEAD',
    port: https ? 443 : 80,
    host: url.host,
    path: url.path,
  }, res => {
    if (res.headers['content-type'].toLowerCase() !== 'application/pdf') {
      return done(null, false)
    }
    done(null, true)
  })
  req.end()
}

