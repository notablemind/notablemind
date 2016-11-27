const React = require('react')
const {css, StyleSheet} = require('aphrodite')

const getTitle = require('./getTitle')

const dateFromURL = url => {
  let parts = url.match(/\d{4}-\d{1,2}-\d{1,2}/)
  if (parts) {
    return parts[0]
  }
  parts = url.match(/\d{4}\/\d{1,2}\/\d{1,2}/)
  if (parts) {
    return parts[0].replace('/', '-')
  }
}

module.exports = class EditSource extends React.Component {
  constructor(props) {
    super()
    // TODO parse the content for a URL & maybe title?
    this.state = props.source || {
      url: '',
      who: '',
      what: '',
      when: '' + new Date().getFullYear(),
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
    const url = e.target.value
    this.setState({
      loading: true,
      url,
    })
    getTitle(url, (err, title) => {
      console.log('fetched', err, title)
      this.setState({
        loading: false,
        when: dateFromURL(url) || this.state.when, // TODO when from HTML
        what: title || this.state.what // TODO titleFromURL
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
    width: 40,
  },

  what: {
    width: 80,
  },

  who: {
    width: 40,
  },

  when: {
    width: 40,
  },

  input: {
    fontSize: 8,
    padding: '2px 5px',
    border: '1px solid #ccc',
    borderRadius: 3,
  },
})
