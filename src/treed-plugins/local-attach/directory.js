import React from 'react'
import path from 'path'
import fs from 'fs'

import getFileIcon from './get-file-icon'
import {getFileType, getFileTypeSync, typeFromStat} from './get-file-type'
import Item from './item'

const getItemInfo = full => {
  const name = path.basename(full)
  try {
    const stat = fs.statSync(full)
    return {
      name,
      path: full,
      type: typeFromStat(full, stat),
      size: stat.size,
      created: stat.ctime,
      modified: stat.mtime,
    }
  } catch (error) {
    return {name, path: full, error}
  }
}

const getDirInfo = (dir, done) => fs.readdir(dir, (err, children) => {
  if (err) return done(err)
  const result = children.map(name => {
    const full = path.join(dir, name);
    return getItemInfo(full)
  });
  return done(null, result)
})

export default class Directory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      loading: false,
      children: [],
    }
  }

  componentDidMount() {
    this.loadChildren(this.props.path)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.loadChildren(nextProps.path)
    }
  }

  loadChildren(path) {
    this.setState({loading: true})
    getDirInfo(path, (err, children) => {
      if (err) {
        this.setState({error: err, loading: false})
      } else {
        this.setState({children, loading: false})
      }
    })
  }

  render() {
    if (this.state.loading) {
      return <div style={styles.container}>
        Loading...
      </div>
    }
    let name = this.props.path
    if (!this.props.isRoot) {
      name = path.basename(name);
    }
    return <div style={styles.container}>
      <Item
        iconsrc={'./icons/folder.png'}
        title={name}
        collapsible={this.state.children.length > 0}
        collapsed={this.state.collapsed}
        onCollapse={collapsed => {
          this.setState({collapsed})
          if (!collapsed) this.loadChildren(this.props.path)
        }}
        onDblClick={() => this.props.onPath(this.props.path)}
      />
      {!this.state.collapsed &&
        <div style={styles.children}>
        {this.state.children.map(child => (
          child.type === 'directory' ?
            <Directory
              path={child.path}
              onPath={this.props.onPath}
            /> :
            <Item
              onDblClick={() => this.props.onPath(child.path)}
              iconsrc={getFileIcon(child.type, child.path)}
              title={child.name}
            />
        ))}
        </div>}
    </div>
  }
}

const styles = {
  children: {
    paddingLeft: 15,
  },
  container: {
  },
}
