const net = require('net')
var portrange = 45032

var port = 45032

var isPortTaken = function(port, fn) {
  var net = require('net')
  var tester = net.createServer()
  .once('error', function (err) {
    console.log('err', err)
    if (err.code != 'EADDRINUSE') return fn(err)
    fn(null, true)
  })
  .once('listening', function() {
    console.log('listen', port, tester)
    tester.once('close', function() { fn(null, false) })
    .close()
  })
  .listen(port, 'localhost')
}

module.exports = function getPort (cb) {
  const next = () => {
    isPortTaken(port, (err, isTaken) => {
      if (err) throw err
      if (isTaken) {
        port += 1;
        next();
      } else {
        cb(port)
      }
    });
  }

  next()
}
