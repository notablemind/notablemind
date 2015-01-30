
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler, Link } = Router;

var BrowsePage = require('./pages/browse')
  // , GistPage = require('./pages/gist')
  , DocPage = require('./pages/doc')

var App = React.createClass({
  render: function () {
    return <RouteHandler className='App'/>
  },
})

module.exports = (
  <Route handler={App}>
    <DefaultRoute name="browse" handler={BrowsePage}/>
    <Route name="doc" path="doc/:id" handler={DocPage}/>
  </Route>
)
// <Route name="gist" path="gist/:id" handler={GistPage}/>

