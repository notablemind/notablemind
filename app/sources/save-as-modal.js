
var showModal = require('./show-modal')

module.exports = function (title, placeholder, done) {
  showModal(title, (state, set, done) =>
    <div>
      <input placeholder={placeholder}
        value={state.title}
        onChange={set('title', true)}/>
      <button onClick={done}>Save</button>
    </div>,
    (data, err) => done(err, data.title))
}

