
import Modal from '../ui/modal'

module.exports = function sourceSettings(source, done) {

  Modal.show({
    title: 'Configure Syncing',
    initialState: {
      autosync: source.autosync,
    },
    width: 300,
    renderBody: (state, set, closed) =>
      <div>
        <label>
        <input type="checkbox" onChange={
          e => set({'autosync': e.target.checked})
        } checked={state.autosync}/> autosync
        </label>
      </div>,
    buttons: {
      Save() {
        this.onClose()
      }
    },
    done,
  })
}

