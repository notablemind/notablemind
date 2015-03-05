
module.exports = {
  title: 'Upload file',
  link: false,
  share: false,
  syncable: false,
  select: function (done) {
    var inp = document.createElement('input')
    inp.type = 'file'
    inp.click()
    inp.addEventListener('change', function () {
      if (!inp.files.length) return
      let reader = new FileReader()
      reader.onload = function (e) {
        done(null, e.target.result, null)
      }
      reader.readAsText(inp.files[0])
    })
  },
}

