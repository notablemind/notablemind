
function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

const pdfDataCache = {}
const getPDFData = module.exports = (url, done) => {
  if (pdfDataCache[url]) {
    return done(null, pdfDataCache[url])
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
      pdfDataCache[url] = toArrayBuffer(buffer)
      done(null, pdfDataCache[url])
    })
  })
  req.end()
}

