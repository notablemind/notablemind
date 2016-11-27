const React = require('react')
const {css, StyleSheet} = require('aphrodite')

const getTitle = require('./getTitle')

const getURL = text => {
  const match = text.match(/https?:\/\/\S+/i)
  return match ? match[0] : ''
}

module.exports = class EditSource extends React.Component {
  constructor(props) {
    super()
    // TODO parse the content for a URL & maybe title?
    this.state = props.source || {
      url: '',
      who: '',
      what: '',
      when: '',
    }
  }

  componentDidMount() {
    this._url.focus()
  }

  onKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 27) { // return + esc
      e.preventDefault()
      e.stopPropagation()
      this.props.onDone(this.state)
    }
  }

  onUrlKeyDown = e => {
    if (e.keyCode === 27) {
      e.preventDefault()
      e.stopPropagation()
      this.props.onDone(this.state)
      return
    }
    if (e.keyCode !== 13) return
    console.log('fetching')
    e.preventDefault()
    e.stopPropagation()
    const url = e.target.value || getURL(this.props.content)
    if (!url) return
    this.setState({
      loading: true,
      url,
    })
    getTitle(url, (err, data) => {
      data = data || {}
      console.log('fetched', err, data)
      this.setState({
        loading: false,
        when: data.date || this.state.when, // TODO when from HTML
        what: data.title || this.state.what // TODO titleFromURL
      })
    })
  }

  render() {
    return <div className={css(styles.container)}>
      <input
        type='text'
        ref={i => this._url = i}
        className={css(styles.input, styles.url)}
        onKeyDown={this.onUrlKeyDown}
        value={this.state.url}
        placeholder="url"
        onChange={e => this.setState({url: e.target.value})}
      />

      <input
        type='text'
        className={css(styles.input, styles.what)}
        value={this.state.what}
        placeholder="what"
        onKeyDown={this.onKeyDown}
        onChange={e => this.setState({what: e.target.value})}
      />
      <input
        type='text'
        className={css(styles.input, styles.who)}
        value={this.state.who}
        placeholder="who"
        onKeyDown={this.onKeyDown}
        onChange={e => this.setState({who: e.target.value})}
      />
      <input
        type='text'
        className={css(styles.input, styles.when)}
        value={this.state.when}
        placeholder="when"
        onKeyDown={this.onKeyDown}
        onChange={e => this.setState({when: e.target.value})}
      />
    </div>
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'row-wrap',
    position: 'absolute',
    right: 0,
    bottom: 5,
    zIndex: 2000,
    fontSize: 8,
  },

  url: {
    width: 150,
  },

  what: {
    width: 150,
  },

  who: {
    width: 100,
  },

  when: {
    width: 50,
  },

  input: {
    fontSize: 8,
    padding: '2px 5px',
    border: '1px solid #ccc',
    borderRadius: 3,
  },
})
