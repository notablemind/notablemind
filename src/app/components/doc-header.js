
import {StyleSheet, css} from 'aphrodite'
import classnames from 'classnames'
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

  getInitialState() {
    return {largeSelected: false}
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
    const kernels = (this.props.treed.store._globals.itreed || {kernels: {}}).kernels
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
          {Object.keys(kernels).map(key => (
            <div key={key}>
              {key}
              <button
                type="button"
                onClick={() => {
                  kernels[key].restart(() => {
                    console.log('restarted')
                    this.props.onClose(null)
                  })
                }}
              >Restart</button>
              <button
                type="button"
                onClick={() => {
                  kernels[key].interrupt(() => {
                    console.log('interrupted')
                    this.props.onClose(null)
                  })
                }}
              >Interrupt</button>
            </div>
          ))}
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

  toggleLarge() {
    if (this.state.largeSelected) {
      document.body.classList.remove('large')
    } else {
      document.body.classList.add('large')
    }
    this.setState({largeSelected: !this.state.largeSelected})
  },

  render: function () {
    var headStore = this.props.treed.store.headerView()
    return <div className={css(styles.DocHeader)}>
      <span className={css(styles.Name)}>
        <a
          className={css(styles.NameLink)}
          target="_blank"
          href="http://notablemind.github.io"
        >
          Notablemind
        </a>
        <a
          className={css(styles.NameLink)}
          target="_blank"
          href="http://github.com/notablemind/notablemind"
        >
          <i className='fa fa-github-alt'/>
        </a>
      </span>
      {!!this.props.onClose &&
        <button
          className={css(styles.DocHeader_home)}
          onClick={this.props.onClose}
        >
          Home
        </button>}
      <Dupload store={this.props.treed.store}/>
      {this.props.treed.options.plugins.map(plugin =>
        plugin.view && plugin.view.global && plugin.view.global(headStore, this.onConfig.bind(this, plugin.id))
      )}
      {!this.props.noSave && <Saver
        onFileUpdate={this.props.onFileUpdate}
        store={this.props.treed.store}
        file={this.props.file}
        value={this.props.file.source}/>}
      <button
        onClick={() => this.toggleLarge()}
        className={css(styles.largeButton,
                       this.state.largeSelected && styles.largeSelected)}
      >
        Large
      </button>
      {/*<i
        className={classnames(
          'fa fa-gear',
          css(styles.gear)
        )}
        onClick={this._showConfig}
        style={{cursor: 'pointer'}}
      />*/}
    </div>
  }
})

module.exports = DocHeader

const styles = StyleSheet.create({
  gear: {
    padding: 6,
  },

  DocHeader: {
    display: 'flex',
    justifyContent: 'center',
    padding: 10,
    position: 'relative',
    flexShrink: 0,
  },

  Name: {
    fontSize: 17,
    fontWeight: 'bold',
    position: 'absolute',
    left: 10,
    top: 5,
    textTransform: 'lowercase',
    fontFamily: 'sans-serif',
    color: '#ccc',
    textDecoration: 'none',
  },

  NameLink: {
    color: '#ccc',
    textDecoration: 'none',
    paddingRight: 10,
  },

  DocHeader_home: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    marginRight: 20,
    cursor: 'pointer',
  },

})
