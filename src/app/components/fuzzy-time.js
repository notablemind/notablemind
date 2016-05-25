// sooo I wanted my own fuzziness.

module.exports = fuzzyTime

function twelveAm(date) {
  var d = new Date(date)
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  return d.getTime()
}

function thisYear(date) {
  var d = new Date(date)
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  d.setDate(1)
  d.setMonth(0)
  return d.getTime()
}

function fuzzyTime(time) {
  time = new Date(time).getTime()
  var now = Date.now()
    , date = new Date(time)
    , _12am = twelveAm(now)
    , jan1st = thisYear(now)
    , diff = (now - time) / 1000
  if (diff < 120) return 'just now'
  if (time < _12am) {
    if (_12am - time < 60 * 60 * 24 * 1000) return 'yesterday'
    if (time < jan1st) {
      return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
    }
    return (date.getMonth() + 1) + '/' + date.getDate()
  }
  var hours = date.getHours()
  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12
  var minutes = date.getMinutes()
  if (minutes < 10) minutes = '0' + minutes
  var ap = date.getHours() > 11 ? 'pm' : 'am'
  return hours + ':' + minutes + ap
}

