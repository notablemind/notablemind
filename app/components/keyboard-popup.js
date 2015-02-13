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

  renderBindings: function (bindings) {
    return modes.map(mode => bindings[mode] &&
      <div className={"KeyboardPopup_bindings_mode KeyboardPopup_bindings_mode-" + mode}>{
        bindings[mode].split(', ').map(binding => <span>{binding}</span>)
      }</div>)
  },

  render: function () {
    return <div className='KeyboardPopup' onClick={this.props.onClose}>
      <div className='KeyboardPopup_body'>
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
                {Object.keys(section.actions).map(action => <tr>
                  <td className="KeyboardPopup_bindings">
                    {
                      this.renderBindings(section.actions[action])
                    }
                  </td>
                  <td className="KeyboardPopup_action">{action}</td>
                </tr>)}
              </tbody>
            </table>
          </div>)}
        </div>
      </div>
    </div>
  },
})

module.exports = KeyboardPopup

