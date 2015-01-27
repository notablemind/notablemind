
module.exports = function readFile(file, done) {
  var reader = new FileReader()
  reader.onerror = () => done(new Error("Failed to load file"))
  reader.onabort = () => done(new Error("Upload cancelled"))
  reader.onload = (evt) => done(null, evt.target.result)
  reader.readAsText(file)
  return reader
}

