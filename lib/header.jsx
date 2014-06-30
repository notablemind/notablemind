/** @jsx React.DOM */

var d = React.DOM
  , BackendPicker = require('./backend-picker.jsx')
  , Importer = require('./importer.jsx')
  , ViewSelector = require('./view-selector.jsx')

var Header = module.exports = React.createClass({
  displayName: 'Header',
  propTypes: {
    back: React.PropTypes.object,
    links: React.PropTypes.array,
    // backType: React.PropTypes.string,
    viewType: React.PropTypes.string.isRequired,
    onChangeViewType: React.PropTypes.func.isRequired,
    onLogout: React.PropTypes.func.isRequired,
    onImport: React.PropTypes.func.isRequired,
    getDataDump: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {
      links: [
        {
          icon: 'help',
          title: 'Problem?',
          url: 'https://nm-errors.herokuapp.com/new'
        }, {
          icon: 'github',
          title: 'Contribute', 
          url: 'https://notablemind.github.io'
        }, {
          icon: 'about',
          title: 'About',
          url: 'https://notablemind.com'
        }
      ],
      back: null,
      backType: null,
      onChangeBack: function (back, type) {
        console.log('want to change to type:', back, type)
      }
    }
  },
  onClickDownload: function () {
    var a = this.refs.download_link.getDOMNode()
      , data = this.props.getDataDump()
      , blob = new Blob([JSON.stringify(data, null, 2)],
                        {type: 'application/json'})
      , url = URL.createObjectURL(blob)
    a.href = url
    a.download = 'notablemind-export.json'
  },
  render: function () {
    return (
      <div className='header'>
        <h1 className='header_title'>Notablemind</h1>
        <ul className='header_links'>
          {
            this.props.links.map(function (link, i) {
              return (
                <li key={i}>
                  <a className='header_link'
                     href={link.url} target='_blank'
                     title={link.title}>
                    {link.icon && d.i({className: 'fa fa-' + link.icon})}
                    {link.title}
                  </a>
                </li>
              )
            })
          }
        </ul>
        <div className='header_spacer'/>
        <ViewSelector
            value={this.props.viewType}
            onChange={this.props.onChangeViewType}
        />
        <Importer btnClassName="header_import" onLoad={this.props.onImport}/>
        <a className="header_download"
           ref="download_link"
           onClick={this.onClickDownload}>
            <i className='fa fa-download'/>
        </a>
        {this.props.onLogout && <button className="header_logout" onClick={this.props.onLogout}>
          Logout
        </button>}
        {/*<BackendPicker currentBack={this.props.back}
          dropdown={true}
          backs={this.props.backs}
          onReady={this.props.onChangeBack}/>*/}
      </div>
    )
  }
})

// vim: set tabstop=2 shiftwidth=2 expandtab:

