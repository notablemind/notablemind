
import http from 'http'

import connect from 'connect'
import serveStatic from 'serve-static'
import compression from 'compression'
import bodyParser from 'body-parser'

import views from './views'

export default run

function run(port, ready) {
  if (arguments.length < 2) {
    ready = port
    port = process.env.PORT || 3000
  }
  if (!ready) {
    ready = () => {
      console.log('ready', port)
    }
  }

  const app = connect()
  app.use(compression())
  app.use(bodyParser.json({limit: '5mb'}))

  app.use('/', views.index)
  app.use('/components/', views.component)
  app.use('/docs/', views.docs)
  app.use('/build',
          serveStatic(__dirname + '/build'))
  app.use('/app',
          serveStatic(__dirname + '/../www'))
  app.use('/vendor',
          serveStatic(__dirname + '/../www/vendor'))

  const server = http.createServer(app)
  server.listen(port, ready.bind(null, server))
}

if (require.main === module) {
  run()
}

