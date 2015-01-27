
module.exports = {
  fromStr: fromStr,
  toStr: toStr,
}

function fromStr(str) {
  try {
    var data = JSON.parse(str)
  } catch (e) {
    return new Error("Failed to parse document")
  }
  var allCells = [].concat.apply([], data.worksheets.map(worksheet => worksheet.cells))
  var pedigree = [{node: {children: []}, level: 0}]
  allCells.forEach(cell => {
    var node = cellToNode(cell)
      , last = pedigree[pedigree.length-1]
    if (cell.cell_type !== 'heading') {
      last.node.children.push(node)
      return
    }
    if (cell.level > last.level) {
      last.node.children.push(node)
      pedigree.push({level: cell.level, node: node})
      return
    }
    for (var i=pedigree.length - 2; i > 0 && pedigree[i].level <= cell.level; i--) { }
    pedigree[i].node.children.push(node)
    pedigree = pedigree.slice(0, i + 1)
    pedigree.push({level: cell.level, node: node})
  })
  return pedigree[0].node.children
}

function convertOutput(output) {
  if (output.output_type === 'stream') {
    output.text = output.text.join('')
    return output
  }
  if (output.html) {
    output['text/html'] = output.html.join('\n')
    delete output.html
  }
  if (output.text) {
    output['text/plain'] = output.text.join('\n')
    delete output.text
  }
  if (output.latex) {
    output['text/latex'] = output.latex.join('\n')
    delete output.latex
  }
  if (output.png) {
    output['image/png'] = output.png
    delete output.png
  }
  return output
}

function cellToNode(cell) {
  if (cell.cell_type === 'code') {
    return {
      content: cell.input.join('\n'),
      type: 'ipython',
      language: cell.language,
      // TODO: preserve prompt number?
      outputs: cell.outputs.map(convertOutput),
      children: [],
    }
  }
  if (cell.cell_type === 'markdown') {
    return {
      type: 'base',
      content: cell.source.join('\n'),
      children: [],
    }
  }
  if (cell.cell_type === 'heading') {
    return {
      type: 'heading',
      content: cell.source.join('\n'),
      children: [],
    }
  }
  console.warn('unknown ipython cell type', cell)
  return {
    type: 'base',
    content: cell.source && cell.source.join('\n'),
    children: []
  }
}

function toHeading(text, level) {
  var pre = ''
  for (var i=0; i<level; i++) {
    pre += '#'
  }
  return pre + ' ' + text
}

function toStr(trees) {
}

