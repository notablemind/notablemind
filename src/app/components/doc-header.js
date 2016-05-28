
import {Form, FormSection, Radio, Panes} from '../../../form'
import Config from '../../../itreed/config'
import DocConfig from './doc-config'
import itreed from 'itreed'

var React = require('react')
  , PT = React.PropTypes
  , Dupload = require('./dupload')
  , Saver = require('./saver')
  , Modal = require('../ui/modal')
  , deepCopy = require('deepcopy')

var DocHeader = React.createClass({
  propTypes: {
    file: PT.object.isRequired,
    treed: PT.object.isRequired,
    noSave: PT.bool,
    saver: PT.node,
    savingEnabled: PT.bool,
    // if not given, no "Home" button will be shown
    onClose: PT.func,
  },

  getDefaultProps: function () {
    return {
      savingEnabled: false,
    }
  },

  _keyDown: function (e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      return this._doneEditing()
    }
  },

  _showConfig() {
    Modal.show({
      title: 'Configure Document',
      buttons: {
        Save() {
          this.onClose()
        },
        Cancel() {
          this.onCancel()
        },
      },
      initialState: deepCopy(this.props.file),
      renderBody(state, set, aaaa) {
        return <DocConfig file={state} change={set}/>
      },
      done: (err, file) => {
        this.props.updateFile(file)
        // ummmmaybe reload document here? b/c we now need to get deps
      },
    })
  },

  onConfig(plugin) {
    const config = this.props.file.plugins && this.props.file.plugins.itreed || {
      jupyter: {
        server:{
          host: 'localhost:8888'
        },
        kernels: {
          python2: {
            variants: {
              default: true,
            }
          }
        }
      }
    }
    Modal.show({
      title: 'iTreed Config',
      initialState: {},
      body() {
        return <Form
          onSubmit={value => this.props.onClose(null, value)}
          initialData={config}>
          <Config
            variants={itreed.availableVariants}
            plugins={itreed.availablePlugins} name='*'/>
          <button type='submit'>
            Submit
          </button>
        </Form>
      },
      done: (err, newConfig) => {
        if (err || !newConfig) return console.error('Aborted config', err, newConfig)
        console.log('Rerender on config')
        
        this.props.updatePlugin('itreed', newConfig)
        /*
        config = newConfig
        treed.store.teardown()
        treed = makeFull(config, changeConfig)
        */
      }
    })
  },

  render: function () {
    var headStore = this.props.treed.store.headerView()
    return <div className='DocHeader'>
      <span className='DocHeader_name'>
        <a target="_blank" href="http://notablemind.github.io">Notablemind</a>
        <a target="_blank" href="http://github.com/notablemind/notablemind">
          <i className='fa fa-github-alt'/>
        </a>
      </span>
      {!!this.props.onClose &&
        <button className='DocHeader_home' onClick={this.props.onClose}>
          Home
        </button>}
      {/*<span className='DocHeader_title'>
        {this.props.file.title}
      </span>*/}
      <Dupload store={this.props.treed.store}/>
      {this.props.treed.options.plugins.map(plugin =>
        plugin.view && plugin.view.global && plugin.view.global(headStore, this.onConfig.bind(this, plugin.id))
      )}
      {!this.props.noSave && <Saver
        onFileUpdate={this.props.onFileUpdate}
        store={this.props.treed.store}
        file={this.props.file}
        value={this.props.file.source}/>}
      <i className='fa fa-gear' onClick={this._showConfig} style={{cursor: 'pointer'}}/>
    </div>
  }
})

module.exports = DocHeader

