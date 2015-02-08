
var showModal = require('./show-modal')

module.exports = function (getFiles, loadFile, done) {
  var setIt
  getFiles((err, files) => {
    if (err) return setIt({loadingFiles: false, error: 'Failed to load files.'})
    setIt({files: files, loadingFiles: false})
  })
  showModal('Import from Google Drive', {loadingFiles: true}, function (state, set, done) {
    setIt = set
    if (state.loadingFiles) {
      return <h2>Loading files from google drive...</h2>
    }
    if (state.loading) {
      return <h2>Importing file...</h2>
    }
    if (state.error) {
      return <span>{state.error}</span>
    }

    var importit = () => {
      set({loading: true})
      tryImport(state.gist_id, (err, result) => {
        if (err) return set({loading: false, error: true})
        this.props.onClose(null, result, state.gist_id)
      })
    }
    var _onImport = (file) => {
      set({loading: true})
      loadFile(file.downloadUrl, (err, result) => {
        if (err) return set({loading: false, error: 'Failed to import file'})
        this.props.onClose(null, result, file)
      })
    }

    // TODO make this a table, display last modfied time, etc.
    // Also -- abstract this out of just google drive
    return <div className='LoadGDrive'>
      <ul className='LoadGDrive_list'>
        {state.files.map(file => 
          <li onClick={_onImport.bind(null, file)}>
            {file.title}
          </li>)}
      </ul>
    </div>

    return React.createElement("div", null, 
      state.error && 'Error loading gist...', 
      "Enter the username and gist id to import:", 
      React.createElement("input", {placeholder: "username/gistid", 
        value: state.gist_id, 
        autoFocus: true,
        onChange: set('gist_id', true)}), 
      React.createElement("button", {onClick: importit}, "Import")
    )
  }, done)
}
