
import React from 'react'
import mime from 'mime'
import open from 'open'

import getFileIcon from './get-file-icon'
import {getFileType} from './get-file-type'
import Directory from './directory'
import Item from './item'

const Empty = () => <div>Drag and drop a file / folder here</div>
const Loading = () => <div>Loading...</div>
const LoadError = ({error}) => <div>Failed to load file...</div>

class LocalAttach extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      loaded: false,
      type: null,
    }
  }

  componentDidMount() {
    if (this.props.node.localFilePath) {
      this.load()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.path !== this.props.path) {
      if (this.props.path) {
        this.load()
      }
    }
  }

  load() {
    getFileType(this.props.node.localFilePath, (err, type) => {
      if (err) {
        this.setState({loaded: true, error: err});
      } else {
        this.setState({type, loaded: true});
      }
    })
  }

  focus() {}
  blur() {}

  onDragOver(e) {
    e.preventDefault()
    return false
  }

  onDragEnd(e) {
    e.preventDefault()
    return false
  }

  onDrop(e) {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      this.props.store.actions.set(this.props.node.id, 'localFilePath', e.dataTransfer.files[0].path);
    }
    return false
  }

  renderContents() {
    if (!this.props.node.localFilePath) {
      return <Empty/>
    }
    if (!this.state.loaded) {
      return <Loading/>
    }
    if (this.state.error) {
      return <LoadError error={this.state.error} />;
    }
    if (this.state.type === 'directory') {
      return <Directory
        path={this.props.node.localFilePath}
        onPath={path => {
          console.log('onPath', path);
          open(path);
        }}
      />
    }
    return (
      <Item
        iconsrc={getFileIcon(this.state.type, this.props.node.localFilePath)}
        title={this.props.node.localFilePath}
      />
    )
  }

  render() {
    return (
      <div
        onDragOver={e => this.onDragOver(e)}
        onDragLeave={e => this.onDragEnd(e)}
        onDragEnd={e => this.onDragEnd(e)}
        onDrop={e => this.onDrop(e)}
        onClick={() => this.props.actions && this.props.actions.edit(this.props.node.id)}
        style={styles.container}
      >
        {this.renderContents()}
      </div>
    )
  }
}

const styles = {
  container: {
  },
};

module.exports = {
  title: 'Local Attach',

  types: {
    localAttach: {
      title: 'LocalAttach',
      shortcut: 'f',
    },
  },

  store: {
  },

  node: {
    bodies: {
      localAttach: {
        renderer() {
          return <LocalAttach
            {...this.props}
            path={this.props.node.localFilePath}
          />
        },
        editor(props) {
          return <LocalAttach {...props}
            path={props.node.localFilePath}
          />
        },
      },
    },

  },
}

