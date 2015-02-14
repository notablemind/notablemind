/**
 * Pops up when you type "?" in normal / visual mode.
 */

var React = require('react')
  , PT = React.PropTypes

var modes = ['insert', 'visual', 'normal']

var KeyboardPopup = React.createClass({
  propTypes: {
    onClose: PT.func.isRequired,
    pages: PT.objectOf(PT.arrayOf(PT.shape({
      title: PT.string,
      actions: PT.objectOf(PT.objectOf(PT.string)),
    }))).isRequired,
  },

  getInitialState: function () {
    return {
      pageIndex: 0,
      fadeIn: false,
    }
  },

  componentDidMount: function () {
    this._resize()
    this.props.keys.disable()
    window.addEventListener('keydown', this._onKeyDown)
    this.setState({fadeIn: true})
  },

  componentWillUnmount: function () {
    this.props.keys.enable()
    window.removeEventListener('keydown', this._onKeyDown)
  },

  _onClose: function () {
    this.setState({fadeIn: false})
    setTimeout(() => this.props.onClose(), 150)
  },

  _onKeyDown: function (e) {
    if (e.keyCode === 27) return this._onClose()
    if (e.keyCode !== 9) return
    e.preventDefault()
    var selection = this.state.pageIndex
      , pages = Object.keys(this.props.pages)
    if (e.shiftKey) {
      selection -= 1
      if (selection < 0) selection = pages.length - 1
    } else {
      selection += 1
      if (selection > pages.length - 1) selection = 0
    }
    this.setState({pageIndex: selection})
  },

  _resize: function () {
    var node = this.refs.body.getDOMNode()
    node.style.width = node.scrollWidth + 'px';
    for (var i=0; i<10 && node.scrollWidth > node.offsetWidth; i++) {
      node.style.width = node.scrollWidth + 'px';
    }
  },

  renderRow: function (action, bindings) {
    var text = bindings.text || bindings.normal || bindings.visual || bindings.insert
    if (!text) return
    return <tr key={action}>
      <td className="KeyboardPopup_bindings">
        {
          text.split(', ').map(binding => <span key={binding}>{binding}</span>)
        }
      </td>
      <td className="KeyboardPopup_action">{bindings.title || action}</td>
    </tr>
  },

  render: function () {
    var pageNames = Object.keys(this.props.pages)
      , currentName = pageNames[this.state.pageIndex]
      , page = this.props.pages[currentName]
    return <div className={'KeyboardPopup' + (this.state.fadeIn ? ' KeyboardPopup-fade-in' : '')} onClick={this._onClose}>
      <div className='KeyboardPopup_body' onClick={e => e.stopPropagation()}>
        <div className="KeyboardPopup_title">
          Notablemind Keyboard Shortcuts
        </div>
        <div className='KeyboardPopup_pages'>
          {pageNames.map((name, i) =>
            <button disabled={i === this.state.pageIndex} onClick={() => this.setState({pageIndex: i})}>
              {name}
            </button>)}
        </div>
        <div ref="body" className="KeyboardPopup_sections">
          {page.map((section, i) => <div key={i} className='KeyboardPopup_section'>
            <div className='KeyboardPopup_section_title'>
              {section.title}
            </div>
            <table>
              <tbody>
                {Object.keys(section.actions).map(action => this.renderRow(action, section.actions[action]))}
              </tbody>
            </table>
          </div>)}
        </div>
      </div>
    </div>
  },
})

module.exports = KeyboardPopup

