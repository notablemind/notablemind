
import React from 'react'

function searchify(text, search) {
  if (!search) return text
  const places = []
  text.replace(new RegExp(search, 'gi'), (occ, where) => places.push([where, occ.length]))
  const parts = []
  let last = 0
  places.forEach(([start, len]) => {
    parts.push(text.slice(last, start))
    parts.push(<span className='match'>{text.slice(start, start+len)}</span>)
    last = start + len
  })
  parts.push(text.slice(last))
  return parts
}

function show_verses(verses, search) {
  let last_book, last_chapter
  if (!verses.length) {
    return <strong>No results</strong>
  }
  return <ul style={verses.length >= 10 ? {
    height: 500,
  } : null} className='scriptures_Verses'>
  {verses.map(verse => {
    let preface = null
    if (verse.book !== last_book || verse.chapter_no !== last_chapter) {
      preface = <span className='scriptures_Verse_preface'>
        <strong>{verse.book} {verse.chapter_no}</strong>
      </span>
      last_book = verse.book
      last_chapter = verse.chapter_no
    }
    let text = searchify(verse.text, search)
    return <li className='scriptures_Verse'>
      {preface}
      <span className='scriptures_Verse_text'>
        <span className='scriptures_Verse_no'>{verse.verse_no}</span>{' '}
        {text}
      </span>
    </li>
  })}
  </ul>
}

const InputEditor = React.createClass({
  focus(at) {
    let pos
    const inp = this.getDOMNode()
    if (at === 'end' || !at) pos = inp.value.length
    if ('number' === typeof at) pos = at
    if (inp !== document.activeElement) inp.focus()
    if (at === 'change') {
      inp.selectionStart = 0
      inp.selectionEnd = inp.value.length
    } else {
      inp.selectionStart = inp.selectionEnd = pos
    }
  },

  isFocused() {
    return this.getDOMNode() === document.activeElement
  },

  render() {
    return <input className="treed_body_rendered scripture_input" onBlur={this.props.onBlur} ref={this.props.ref} placeholder="Type a scripture ref, e.g. 1 ne 3:7" onChange={e => this.props.onChange(e.target.value)} value={this.props.value}/>
  }
})

export default {
  title: 'Scriptures',

  types: {
    'scripture-ref': {
      title: 'Scripture',
      shortcut: 's',
    },
  },

  keys: {
    'lookup scripture': {
      type: 'scripture-ref',
      normal: 'shift+enter',
      insert: 'shift+enter',
      visual: 'shift+enter',
    },
  },

  contextMenu: function (node, state) {
    if (!node || node.type !== 'scripture-ref') return
    return [{
      title: 'Lookup',
      action: 'lookupScripture',
    }]
  },

  node: {
    blocks: {
      belowbody: function (node, actions, state, store) {
        if (node.type !== 'scripture-ref') return
        if (node.scripture_error) {
          return <strong>Error loading scripture: {node.scripture_error}</strong>
        }
        if (node.waiting) {
          return <em>loading...</em>
        }
        if (node.verses) {
          return show_verses(node.verses, node.search)
        }
        return <em>type something...</em>
      }
    },

    bodies: {
      'scripture-ref': {
        renderer: function () {
          return <span onClick={this.props.onFocus} className='treed_body_rendered'>
            {this.props.node.content}
          </span>
        },
        editor: function (props) {
          return <InputEditor {...props}/>
        },
      },
    },
  },

  store: {
    actions: {
      lookupScripture(id) {
        id = id || this.view.active

        var node = this.db.nodes[id]
        if (!node || node.type !== 'scripture-ref') return

        var refocus
        if (this.view.mode === 'insert') {
          refocus = document.activeElement
          document.activeElement.blur()
        }

        const histIx = this.update(id, {
          waiting: true,
        })

        const content = node.content

        getScriptures(content, (err, results) => {
          this.update(id, {
            verses: results.verses,
            search: results.search,
            waiting: false,
            scripture_error: err
          }, histIx)
        })

        if (refocus) {
          refocus.focus()
        }
      },
    }
  },
}

function getScriptures(content, done) {
  const xhr = new XMLHttpRequest()
  xhr.open('get', 'http://localhost:7274/' + content)
  xhr.responseType = 'json'
  xhr.onload = function (e) {
    if (this.status === 200) {
      return done(null, this.response)
    }
    done(new Error('failed to get response from server'))
  }
  xhr.send()
}

