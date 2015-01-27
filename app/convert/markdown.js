
module.exports = {
  parse: parse,
  dump: dump
}

function head(level) {
  var t = '#'
  for (var i=0; i<level; i++) {
    t += '#'
  }
  return t
}

function dumpDown(level, node) {
  if (node.type === 'ipython') {
    return '```' + node.language + '\n' + node.content + '\n```' + (
      node.children ?
        '\n' + node.children.map(dumpDown.bind(null, level)).join('\n\n') :
        ''
    )
  }
  if (node.children.length) {
    return head(level) + ' ' + node.content + '\n\n' + node.children.map(dumpDown.bind(null, level + 1)).join('\n\n')
  }
  return node.content
}

function dump(trees) {
  return trees.map(dumpDown.bind(null, 0)).join('\n\n')
}

function parse(text) {
  return {content: text, children: []}
}

