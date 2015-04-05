
export {toReg, highlight}

function toReg(needle) {
  return new RegExp(needle
    .replace('.', '\\.')
    .replace('*', '.*?'), 'gi');
}

function highlight(text, needle, maxSize) {
	var rx = toReg(needle)

  var items = []
  var last = 0
  text.replace(rx, (matched, pos, full) => {
    items.push(full.slice(last, pos))
    items.push(<strong>{matched}</strong>)
    last = pos + matched.length
  })
  items.push(text.slice(last))
  if (text.length > maxSize) {
    var ln = 0
    if (items[0].length > maxSize/2) {
      items[0] = items[0].slice(-maxSize/2)
    }
    ln = items[0].length
    for (var i=2; i<items.length; i+=2) {
      if (ln + items[i].length > maxSize) {
        items[i] = items[i].slice(maxSize - ln)
        return items.slice(0, i+1)
      }
      ln += items[i].length
    }
  }
  return items
}

