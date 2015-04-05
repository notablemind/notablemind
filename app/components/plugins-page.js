
import React from 'react'

/*
function lazyGetPlugin(plugin, done) {
  getDeps(plugin, () => {
    if (plugin.name === 'itreed') {
      require.ensure([], () => 
    }
  })
}

const plugins = {
  itreed: {

  }
}
*/

export default React.createClass({
  render() {
    return <div>
      Here you can configure plugins ....
      How do I have optional plugins though?
      Lazy loading?
      There needs to be a list of lazy-loadable plugins, and a way to lazy load them.
      Yup.
      I'll first try with itreed.
    </div>
  },
})

