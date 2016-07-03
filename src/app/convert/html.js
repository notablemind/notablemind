

const fullHtml = (title, body) => `
<!doctype html>
<html>
<head>
${title}
</head>
<body>
${body}
</body>
</html>
`

export const toStr = trees => {
  const body = treesToHTML(trees, 0)
  return fullHtml('notablemind', body)
}

const treesToHTML = (trees, level) => {
  return trees.map(node => {
    let text = ''
    /*
    if (level <= 2) {
      if (node.children.length) {
        text += `<h${level + 1}>${node.content}</h${level + 1}>\n`
      } else {
        text += '<p>' + node.content + '</p>\n'
      }
    } else {
    */
      text += '<li>' + node.content + '\n'
    //}
    if (node.children.length) {
      //if (level > 2) {
        text += '<ul>\n'
      //}
      text += treesToHTML(node.children, level + 1)
      //if (level > 2) {
        text += '</ul>\n'
      //}
    }
    //if (level > 2) {
      text += '</li>\n'
    //}
    return text
  }).join('\n')
}

const treesToMoreHTML = (trees, level) => {
  return trees.map(node => {
    let text = ''
    if (level <= 2) {
      if (node.children.length) {
        text += `<h${level + 1}>${node.content}</h${level + 1}>\n`
      } else {
        text += '<p>' + node.content + '</p>\n'
      }
    } else {
      text += '<li>' + node.content + '\n'
    }
    if (node.children.length) {
      if (level > 2) {
        text += '<ul>\n'
      }
      text += treesToHTML(node.children, level + 1)
      if (level > 2) {
        text += '</ul>\n'
      }
    }
    if (level > 2) {
      text += '</li>\n'
    }
    return text
  }).join('\n')
}

export const fromStr = str => {
}

