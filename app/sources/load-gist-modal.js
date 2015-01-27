/* @flow */

var showModal = require('./show-modal')

                                           

module.exports = function (tryImport                                                              , done    ) {
  showModal('Import a Gist', function (state, set, done) {
    if (state.loading) {
      return React.createElement("div", null, "Loading...")
    }

    var importit = () => {
      set({loading: true})
      tryImport(state.gist_id, (err, result) => {
        if (err) return set({loading: false, error: true})
        this.props.onClose(null, result, state.gist_id)
      })
    }

    return React.createElement("div", null, 
      state.error && 'Error loading gist...', 
      "Enter the username and gist id to import:", 
      React.createElement("input", {placeholder: "username/gistid", 
        value: state.gist_id, 
        onChange: set('gist_id', true)}), 
      React.createElement("button", {onClick: importit}, "Import")
    )
  }, done)
}
