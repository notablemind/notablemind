
import compile from './compile'

import targets from './target'

for (let name in targets) {
  compile(targets[name], name, true)
}


