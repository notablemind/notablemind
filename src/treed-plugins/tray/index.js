import React, {Component} from 'react'
import Listener from 'treed/listener'
import {StyleSheet, css} from 'aphrodite'
import PDF from 'react-pdf-js'

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
        onDocumentComplete={pages => this.setState({pages})}
        onPageComplete={page => this.setState({page})}
        page={this.state.page}
        binaryContent={this.props.data} />
    </div>
  }
}

class WebEmbed extends Component {
  render() {
    return <div >
      <input placeholder="paste stuff?" />
      <webview
        src={this.props.url}
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

    return <WebEmbed hidden={!this.state.open} url={this.props.url} />
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
      this.setState({items: [...this.state.items, {url: e.target.href}]})
    }, true)
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
