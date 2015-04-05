
import React from 'react'
import Panes from './panes'
import PluginsPage from './plugins-page'

const {PropTypes: PT} = React

export default React.createClass({
  propTypes: {
    file: PT.object,
    change: PT.func,
  },
  render() {
    const {file, change} = this.props
    return <Panes panes={{
      General: () => {
        return <div>
          Something general. What do we even put here?
          {file.title}
        </div>
      },
      Plugins: () => {
        return <PluginsPage
          data={file.plugins}
          change={val => change('plugins', val)}
        />
      },
      Sync: () => {
        return <h1>This is where you configure syncage. {file.source}</h1>
      }
    }}/>
  },
})

