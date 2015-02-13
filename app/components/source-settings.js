
var showModal = require('../ui/show-modal')

module.exports = function sourceSettings(source, done) {
  showModal('Configure Syncing', {
    autosync: source.autosync,
  }, function (state, set, done) {
    return <div>
      <label>
      <input type="checkbox" onChange={(e) => {
        set({'autosync': e.target.checked})
      }} checked={state.autosync}/> autosync
      </label>
      <button onClick={() => done(null, {autosync: state.autosync})}>
        Save
      </button>
    </div>
  }, done)
}

