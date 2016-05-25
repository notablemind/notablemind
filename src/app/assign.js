
module.exports = function (dest) {
  for (var i=1; i<arguments.length; i++) {
    if (!arguments[i]) continue
    for (var name in arguments[i]) {
      dest[name] = arguments[i][name]
    }
  }
  return dest
}

