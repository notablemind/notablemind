const httpServer = require('http-server');
const getPort = require('./get-port');

module.exports = (cb) => {
  getPort(port => {
    const server = httpServer.createServer({
      root: __dirname + '/../www',
      cache: -1,
    })
    server.listen(port, 'localhost', function() {
      console.log('server ready: http://localhost:' + port);
      cb(port)
    });
  });
}
