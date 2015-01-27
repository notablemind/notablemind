
module.exports = {
  get: getLocationId,
  set: setLocationId,
}

function getLocationId() {
  return window.location.search.slice(1).split('/')[0]
}

function setLocationId(id) {
  if (getLocationId() === id) return
  window.history.pushState(null, null, '?' + id)
}

