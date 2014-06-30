
var isValidFormat = module.exports = function (data) {
  if (!data.meta || (data.content && 'string' !== typeof data.content)) {
    return false
  }
  if (data.children) {
    if (!Array.isArray(data.children)) {
      return false
    }
    for (var i=0; i<data.children.length; i++) {
      if (!isValidFormat(data.children[i])) {
        return false
      }
    }
  }
  return true
}

