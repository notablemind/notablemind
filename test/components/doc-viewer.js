
export default {
  FixturePath: 'tutorial-dump.nm.json',
  ComponentName: 'DocViewer',
  ComponentPath: 'doc-viewer.js',
  ExtraImports: `
    import Treed from 'treed/classy'
    import MemPL from 'treed/pl/mem'
    ticks.add('load:treed')
  `,
  ExtraSetup: `
    var IJS = require('itreed/lib/kernels/js')
    ticks.add('load:ijs')
    var itreed = require('itreed')
    ticks.add('load:itreed')

    var plugins = [
      require('treed/plugins/undo'),
      require('treed/plugins/todo'),
      require('treed/plugins/image'),
      require('treed/plugins/types'),
      require('treed/plugins/collapse'),
      require('treed/plugins/clipboard'),
      require('treed/plugins/lists'),
      require('treed/plugins/rebase'),
      require('../../treed-plugins/custom-css'),
      itreed({
        type: 'ijs',
        language: 'javascript',
        remote: false,
        title: 'Javascript',
        kernel: IJS,
      }),
    ]

    ticks.add('load:plugins')

  `,
  Setup(done) {
    treedFromFile(Treed, fixture, plugins, pl, done)
  },
  MakeEl(err, {treed, file}) {
    return <DocViewer
      saveWindowConfig={(a, b) => {b()}}
      keys={treed.keyManager}
      treed={treed}
      file={file}/>
  },
}

