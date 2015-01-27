
module.exports = {
  toStr: toStr,
  fromStr: fromStr,
}

function toStr(trees) {
  return trees.map(nodeToStr).join('\n\n')
}

function fromStr(str) {
  return [{
    content: str,
    type: 'ipython',
    language: 'javascript',
    children: [],
  }]
}

function nodeToStr(node) {
  var str = ''
  if (node.type === 'ipython' && node.language === 'javascript') {
    str += node.content
  } else {
    str += node.content.replace(/(^|\n)/g, '$1// ')
  }

  if (node.children && node.children.length) {
    str += '\n\n' + node.children.map(nodeToStr).join('\n\n')
  }
  return str
}

