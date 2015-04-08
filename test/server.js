
import http from 'http'

import connect from 'connect'
import serveStatic from 'serve-static'
import compression from 'compression'
import bodyParser from 'body-parser'

import views from './views'

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

http.createServer(app)
  .listen(process.env.PORT || 3000, () => {
    console.log('ready', process.env.PORT || 3000)
  })

