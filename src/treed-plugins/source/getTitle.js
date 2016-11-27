
const checkIsHTML = require('./checkIsHTML')

const titleCache = {}
const contentsCache = {}

const dataFromHtml = (html, url, headers) => ({title: titleFromHtml(html, url), date: dateFromHTML(html, url, headers)})

const titleFromHtml = html => {
  const match = html.match(/<title[^>]*>([^<]+)/i)
  console.log(match)
  window.lastH = html
  return !!match && match[1]
}

const formatDate = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

const dateFromDaysAgo = daysAgo => {
  const d = new Date(Date.now() - daysAgo * (1000 * 60 * 60 * 24))
  return formatDate(d)
}

const isHN = url => !!url.match(/^https?:\/\/news.ycombinator.com\//i)

const dateFromURL = url => {
  let parts = url.match(/\d{4}-\d{1,2}-\d{1,2}/)
  if (parts) {
    return parts[0]
  }
  parts = url.match(/\d{4}\/\d{1,2}\/\d{1,2}/)
  if (parts) {
    return parts[0].replace(/\//g, '-')
  }
  parts = url.match(/\d{4}\/\d{2}/)
  if (parts) {
    return parts[0].replace(/\//g, '-')
  }
}

const isGithub = url => !!url.match(/^https?:\/\/github.com\/[^\/]+\/[^\/]+$/i)

const getLatestCommitTime = html => {
  const times = []
  html.replace(/time-ago datetime="([^"]+)/ig, (_, d) => times.push(d))
  times.sort()
  console.log(times)
  return times.length ? formatDate(new Date(times[times.length - 1])) : null
}

const isWayback = url => !!url.match(/^https?:\/\/web\.archive\.org\/web\/\d+\//i)

const getWayback = url => {
  const match = url.match(/^https?:\/\/web\.archive\.org\/web\/(\d+)\//i)
  if (!match) return
  const nums = match[1]
  const year = nums.slice(0, 4)
  const month = nums.slice(4,6)
  const day = nums.slice(6,8)
  return `${year}-${month}-${day}`
}

const dateFromHTML = (html, url, headers) => {
  if (isHN(url)) {
    m = html.match(/(\d+) days ago/i)
    return m ? dateFromDaysAgo(+m[1]) : null
  }
  if (isGithub(url)) {
    const latest = getLatestCommitTime(html)
    if (latest) return latest
  }
  let m = html.match(/<meta itemprop="datePublished" content="(\d{4}-\d{1,2}-\d{1,2})/i)
  if (m) return m[1]
  m = dateFromURL(url)
  if (m) return m
  m = html.match(/<meta property="article:modified_time" content="(\d{4}-\d{1,2}-\d{1,2})/i)
  if (m) return m[1]
  if (headers['last-modified']) {
    return formatDate(new Date(headers['last-modified']))
  }
  m = html.match(/\d{4}-\d{1,2}-\d{1,2}/)
  if (m) return m[0]
  m = html.match(/&copy; (\d{4})/i)
  if (m) return m[1]
  if (isWayback(url)) {
    const date = getWayback(url)
    if (date) return date
  }
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
      let uncompressed = res.headers['content-encoding'] === 'gzip' ? res.pipe(require('zlib').createGunzip()) : res;
      uncompressed.on('data', bb => {
        if (!buffer) {
          buffer = bb
        } else {
          buffer = Buffer.concat([buffer, bb])
        }
      })
      uncompressed.on('end', () => {
        console.log('got')
        if (!buffer) {
          return done(true)
        }
        // console.log(res.headers)
        contentsCache[url] = buffer.toString('utf8')
        titleCache[url] = dataFromHtml(contentsCache[url], url, res.headers)
        done(null, titleCache[url])
      })
      res.on('error', () => {
        done(new Error('error getting stream'))
      })
    })
    req.on('error', () => {
        done(new Error('error getting stream'))
    })
    req.end()
  })
}
