
import path from 'path'

const rel = p => path.join(__dirname, p)

const targets = {
  './build/components/doc-viewer.js': [
    './components/tpl.js',
    './components/doc-viewer.js',
  ],
  './build/viewer.js': './viewer/index.js', 
}

const rels = {}
for (let name in targets) {
  const rname = rel(name)
  if (Array.isArray(targets[name])) {
    rels[rname] = targets[name].map(rel)
  } else {
    rels[rname] = rel(targets[name])
  }
}

export default rels

