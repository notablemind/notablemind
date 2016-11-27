
const checkIsHTML = require('./checkIsHTML')

const titleCache = {}
const contentsCache = {}

const titleFromHtml = html => {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return !!match && match[1]
}

const getTitle = module.exports = (url, done) => {
  if (titleCache[url]) {
    return done(null, titleCache[url])
  }
  checkIsHTML(url, (err, isHTML) => {
    if (err) return done(err)
    if (!isHTML) {
      console.log('not html')
      return done()
    }
    const https = url.match(/^https/)
    const req = require(https ? 'https' : 'http').get(url, res => {
      let buffer = null
      res.on('data', bb => {
        if (!buffer) {
          buffer = bb
        } else {
          buffer = Buffer.concat([buffer, bb])
        }
      })
      res.on('end', () => {
        console.log('got')
        if (!buffer) {
          return done(true)
        }
        contentsCache[url] = buffer.toString('utf8')
        titleCache[url] = titleFromHtml(contentsCache[url])
        done(null, titleCache[url])
      })
      res.on('error', () => {
        done(new Error('error getting stream'))
      })
    })
    req.end()
  })
}
