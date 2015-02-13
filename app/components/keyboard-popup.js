/**
 * Pops up when you type "?" in normal / visual mode.
 */

var React = require('react')
  , PT = React.PropTypes

var modes = ['insert', 'visual', 'normal']

var KeyboardPopup = React.createClass({
  propTypes: {
    onClose: PT.func.isRequired,
    sections: PT.arrayOf(PT.shape({
      title: PT.string,
      actions: PT.objectOf(PT.arrayOf(PT.string)),
    })).isRequired,
  },

  componentDidMount: function () {
    var node = this.refs.body.getDOMNode()
    node.style.width = node.scrollWidth + 'px';
  },

  renderRow: function (action, bindings) {
    var text = bindings.text || bindings.normal || bindings.visual || bindings.insert
    if (!text) return
    return <tr>
      <td className="KeyboardPopup_bindings">
        {
          text.split(', ').map(binding => <span>{binding}</span>)
        }
      </td>
      <td className="KeyboardPopup_action">{bindings.title || action}</td>
    </tr>
  },

  render: function () {
    return <div className='KeyboardPopup' onClick={this.props.onClose}>
      <div className='KeyboardPopup_body' onClick={e => e.stopPropagation()}>
        <div className="KeyboardPopup_title">
          Notablemind Keyboard Shortcuts
        </div>
        <div ref="body" className="KeyboardPopup_sections">
          {this.props.sections.map(section => <div className='KeyboardPopup_section'>
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

