import React, {Component} from 'react'
import Listener from 'treed/listener'
import {StyleSheet, css} from 'aphrodite'
import path from 'path'

const checkIsPDF = require('./checkIsPDF')
const getPDFData = require('./getPDFData')

const CAN_PDF = ELECTRON

class PDFEmbed extends Component {
  constructor() {
    super()
    this.state = {
      pages: 0,
      page: 1,
    }
  }

  render() {
    const PDF = require('react-pdf-js').default
    return <div
      className={css(this.props.hidden && styles.iframeHidden)}
    >
      <button onClick={() => this.setState({
        page: Math.max(this.state.page - 1, 1)
      })}>
        Prev
      </button>
        {this.state.page} / {this.state.pages}
      <button onClick={() => this.setState({
        page: Math.min(this.state.page + 1, this.state.pages)
      })}>
        Next
      </button>
      <PDF
        ref={pdf => this._pdf = pdf}
        scale={1.5}
        onDocumentComplete={pages => this.setState({pages})}
        onPageComplete={page => this.setState({page})}
        page={this.state.page}
        binaryContent={this.props.data} />
    </div>
  }
}

const showMenu = items => {
  const {Menu, MenuItem} = require('electron').remote
  const menu = new Menu()
  items.forEach(item => menu.append(new MenuItem(item)))
  menu.popup()
}

class WebEmbed extends Component {
  componentDidMount() {
    console.log('mounted')
    this._wv.addEventListener('ipc-message', e => {
      const data = e.channel
      if (data.type === 'link meta click') {
        this.props.addURL(data.href)
      } else if (data.type === 'link click') {
        require('open')(data.href)
      } else if (data.type === 'image') {
        showMenu([{
          label: 'Copy image source',
        }])
      }
      console.log('message', e)
    })
  }

  render() {
    return <div >
      <input placeholder="paste stuff?" />
      <webview
        ref={w => this._wv = w}
        // TODO fix this absolute reference
        preload={'file:///Users/jared/clone/notablemind/src/treed-plugins/tray/preload.js'}
        src={this.props.url}
        onContextMenu={e => {
          console.log('Context menu request!')
          console.log(e)
          console.log(e.target)
        }}
        className={css(styles.iframe, this.props.hidden && styles.iframeHidden)}
      />
    </div>
  }
}

class Embed extends Component {
  constructor() {
    super()
    this.state = {
      open: true,
      loading: CAN_PDF,
      isPDF: false,
      gettingPDF: false,
    }
  }

  componentDidMount() {
    if (CAN_PDF) {
      checkIsPDF(this.props.url, (err, isPDF) => {
        if (err || !isPDF) {
          return this.setState({loading: false, gettingPDF: false})
        }
        this.setState({gettingPDF: true})
        getPDFData(this.props.url, (err, arrayBuffer) => {
          if (err) {
            return this.setState({loading: false, gettingPDF: false})
          }
          this.setState({
            pdfData: arrayBuffer,
            loading: false,
            gettingPDF: false
          })
        })
      })
    }
  }

  renderBody() {
    if (this.state.gettingPDF) {
      return 'getting PDF'
    }
    if (this.state.loading) {
      return 'loading'
    }

    if (this.state.pdfData) {
      return <PDFEmbed
        hidden={!this.state.open}
        data={this.state.pdfData}
      />
    }

    return <WebEmbed
      addURL={this.props.addURL}
      hidden={!this.state.open} url={this.props.url} />
  }

  render() {
    // TODO retrieve the title?
    return <div className={css(styles.embedContainer)}>
      <div
        className={css(styles.embedTitle)}
        onClick={() => this.setState({open: !this.state.open})}
      >
        {this.props.url}
        <button onClick={this.props.onRemove}>&times;</button>
      </div>
      {this.renderBody()}
    </div>
  }
}

module.exports = class Tray extends Component {
  constructor() {
    super()
    this.state = {
      items: [],
    }
  }

  componentDidMount() {
    window.addEventListener('click', e => {
      if (!e.metaKey || !e.target.href) return
      e.preventDefault()
      e.stopPropagation()
      this.addURL(e.target.href)
    }, true)
  }

  addURL = (url) => {
    this.setState({items: [...this.state.items, {url}]})
  }

  onRemove = item => {
    const items = this.state.items.slice()
    items.splice(items.indexOf(item), 1)
    this.setState({items})
  }

  render() {
    return <div className={css(styles.container)}>
      <div className={css(styles.title)}>
        Tray
      </div>
      {this.state.items.map((item, i) => (
        item.url ?
          <Embed
            key={item.url}
            addURL={this.addURL}
            onRemove={() => this.onRemove(item)}
            url={item.url}
          /> :
          <div key={i}>unsupported type</div>
      ))}

    </div>
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
  },

  title: {
    fontSize: 10,
    color: '#aaa',
    padding: 10,
  },

  embedContainer: {
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
  },

  embedTitle: {
    padding: '10px 20px',
    fontFamily: 'monospace',
    // fontSize: '1.5em',
    cursor: 'pointer',
  },

  iframe: {
    border: '1px solid #ccc',
    boxShadow: '0 0 5px #aaa',
    height: 800,
  },

  iframeHidden: {
    height: 0,
    overflow: 'hidden',
    // display: 'none',
  },

})
