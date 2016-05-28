
import React from 'react'
import { Route, DefaultRoute, RouteHandler, Link } from 'react-router'

var BrowsePage = require('./pages/browse')
  , DocPage = require('./pages/doc')
  , GistPage = require('./pages/gist')

var App = React.createClass({
  render: function () {
    return <RouteHandler className='App'/>
  },
})

module.exports = (
  <Route handler={App}>
    <DefaultRoute name="browse" handler={BrowsePage}/>
    <Route name="doc" path="doc/:id" handler={DocPage}/>
    <Route name='gist' path='gist/:uid/:id' handler={GistPage}/>
    {/** TODO make a route gist/:id that finds out the username and redirects **/}
    <Route name='gist-browse' path='gist' handler={GistPage}/>
  </Route>
)
// <Route name='gist' path'gist/:id' handler={GistPage}/>

