
var showModal = require('./show-modal')

module.exports = function (authorize, done) {
  showModal('Authorize with Google Drive', function (state, set, done) {
    if (state.loading) {
      return <div>Loading...</div>
    }

    var doAuth = () => {
      set({loading: true})
      authorize(err => {
        if (!err) return this.props.onClose(null)
        set({error: true, loading: false})
      })
    }

    return <div>
      {state.error && 'Failed to authorize'}
      <button onClick={doAuth}>Authorize with Google Drive</button>
    </div>
  }, done)
}

