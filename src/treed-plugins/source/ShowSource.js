const React = require('react')
const {css, StyleSheet} = require('aphrodite')

const cutoff = (txt, len) => txt ? (txt.length > len ? txt.slice(0, len - 3) + '...' : txt) : ''
const shortURL = url => {
  if (!url) return ''
  const match = url.match(/https?:\/\/([^\/]+)/i)
  return match ? match[1] : cutoff(url, 50)
}

const innards = ({url, what, when, who}, big) => {
  if (url && what) {
    return <div className={css(styles.container, big && styles.big)}>
      <span className={css(styles.primary)}>
        {cutoff(what, 50)}
      </span>
      <a className={css(styles.secondary)} href={url}>
        {shortURL(url)}
      </a>
      {link}
    </div>
  }
  if (url) {
    return <div className={css(styles.container, big && styles.big)}>
      <a href={url} className={css(styles.primary)}>
        {cutoff(url, 50)}
      </a>
      {link}
    </div>
  }
  if (what) {
    return <div className={css(styles.container, big && styles.big)}>
      <span className={css(styles.primary)}>
        {cutoff(what, 50)}
      </span>
      {link}
    </div>
  }
  return <div className={css(styles.container)}>
    no source title {link}
  </div>
}

// TODO if node has no contents, then make this big & ~in the place of content
module.exports = ({source, isActive, isEmpty}) => (
  !source ? <div/> :
    (isActive ?
      innards(source) :
      (isEmpty ?
       innards(source, true) :
        <div className={css(styles.container, styles.placeholder)}>{link}</div>)
    )
)

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    right: -10,
    bottom: -5,
    zIndex: 2000,
    fontSize: 8,
    backgroundColor: 'white',
    padding: '1px 2px',
    boxShadow: '0 0 2px #ccc',
    borderRadius: 2,
  },

  big: {
    fontSize: 10,
    boxShadow: 'none',
    backgroundColor: 'transparent',
    bottom: 5,
    right: 20,
  },

  link: {
    marginLeft: 10,
  },

  placeholder: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },

  secondary: {
    color: '#777',
    marginLeft: 10,
  },
})

const link = <span className={css(styles.link)}>🔗</span>

