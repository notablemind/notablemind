
module.exports = {
  fromStr: fromStr,
  toStr: toStr,
  parseSections: parseSections,
}

function toStr(trees) {
  var sections = treesToSections(trees)
  return ';; gorilla-repl.fileformat = 1\n\n' + sections.map(section => section.join('\n')).join('\n\n') + '\n'
}

function treesToSections(trees) {
  var sections = []
  trees.forEach((tree) => {
    sections.push(nodeToSection(tree))
    if (tree.children.length) {
      sections = sections.concat(treesToSections(tree.children))
    }
  })
  return sections
}

function nodeToSection(node) {
  if (!node.type || node.type === 'base') {
    return [';; **'].concat(node.content.split('\n').map((line) => ';;; ' + line), [';; **'])
  }
  if (node.type === 'ipython') {
    // TODO outputs
    return [';; @@'].concat(node.content.split('\n'), [';; @@'], outputsToSection(node.outputs))
  }
  console.warn('Unknown section type', node.type, node)
  return []
}

function outputsToSection(allOutputs) {
  var streams = []
    , outputs = []
  allOutputs.forEach(output => {
    if (output.output_type === 'stream') {
      streams.push(output.text)
    } else {
      outputs.push(output)
    }
  })
  var result = []
  if (streams.length) {
    result = result.concat([';; ->'], streams, [';; <-'])
  }
  if (outputs.length) {
    result = result.concat([';; =>', ';;; ' + JSON.stringify(convertOutputs(outputs)), ';; <='])
  }
  return result
}

function convertOutputs(outputs) {
  var last = outputs[outputs.length - 1]
    , result = {value: last['text/plain']}
  if (last['json/list-like']) {
    return last['json/list-like']
  } else if (last['json/vega']) {
    result.type = 'vega'
    result.content = last['json/vega']
  } else if (last['json/latex']) {
    result.type = 'latex'
    result.content = last['json/latex'].content
  } else if (last['text/html']) {
    result.type = 'html'
    result.content = last['text/html']
  } else {
    result.type = 'text'
    result.content = last['text/plain']
  }
  return result
}

function fromStr(str) {
  var sections = parseSections(str)
    , nodes = []
    , body
    , lastCode
  for (var i=0; i<sections.length; i++) {
    body = sections[i].slice(1)
    switch (sections[i][0]) {
      case 'md':
        nodes.push(parseMarkdown(body))
        break;
      case 'code':
        nodes.push(lastCode = parseCode(body))
        break;
      case 'stream':
        addStream(lastCode, body)
        break;
      case 'out':
        addOutput(lastCode, body)
        break;
    }
  }
  return nodes
}

function dedent(items) {
  return items.map(function (line) {return line.slice(4)})
}

function parseMarkdown(body) {
  return {
    content: dedent(body).join('\n'),
    children: [],
    type: 'base'
  }
}

function parseCode(body) {
  return {
    content: body.join('\n'),
    children: [],
    type: 'ipython',
    language: 'clojure',
    outputs: [],
  }
}

function addStream(node, body) {
  node.outputs.push({
    output_type: 'stream',
    stream: 'stdout',
    text: dedent(body).join('\n'),
  })
}

function addOutput(node, body) {
  var value = JSON.parse(dedent(body).join('\n'))
  var suppressable = value.value === 'nil' || value.value.slice(0, 2) === "#'"
  node.outputs.push({
    output_type: 'pyout',
    suppressable: suppressable,
    'text/html': value.type === 'html' && value.content,
    'json/vega': value.type === 'vega' && value.content,
    'json/list-like': value.type === 'list-like' && value,
    'json/latex': value.type === 'latex' && value,
    'text/plain': value.value,
  })
}

var ENTRY = {
  '': false,
  ';; **': 'md',
  ';; @@': 'code',
  ';; =>': 'out',
  ';; ->': 'stream'
}

var EXIT = {
  'md':     ';; **',
  'code':   ';; @@',
  'out':    ';; <=',
  'stream': ';; <-',
}

function parseSections(str) {
  var lines = str.split('\n')
  var sections = []
  var insection = false
  var section
  var line
  for (var i=0; i<lines.length; i++) {
    line = lines[i].trim()
    if (!insection) {
      if (line in ENTRY) {
        insection = ENTRY[line]
        if (insection) {
          sections.push(section = [insection])
        }
      } else {
        console.warn('unexpected line outside of a section', line)
      }
      continue
    }
    if (line === EXIT[insection]) {
      insection = false
      continue
    }
    section.push(lines[i])
  }
  return sections
}

