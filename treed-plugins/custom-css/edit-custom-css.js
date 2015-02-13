
var Modal = require('../../app/ui/modal');

module.exports = function (current, done) {
  Modal.show({
    title: 'Edit Custom CSS Classes',
    initialState: {classes: current},
    buttons: {
      ok: function () {this.props.onClose(null, this.state.classes)},
      cancel: function () {this.props.onClose(true)},
    },
    renderBody: function () {
      var change = this._onChangeEvt.bind(null, 'classes')

      return <div>
        <input
          value={this.state.classes}
          placeholder="Space-separated css class names"
          onChange={change} />
      </div>
    },
    done: done,
  })
}

