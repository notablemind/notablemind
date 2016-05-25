/**
 * Automatically register and deregister keys for a component.
 */

/**
 * Example usage
 *
 *  var MyComponent = React.createClass({
 *      mixins: [KeysMixin],
 *
 *      statics: {
 *          keys: function () { // this is the component
 *              return {
 *                  'k': this.hireKoala,
 *                  'q': this.onQuit,
 *              }
 *          },
 *      },
 *  })
 */

module.exports = {
  _registerKeys: function (keys, config) {
    if (!arguments.length) keys = this.props.keys
    if (!config && this.constructor.keys) {
      config = this.constructor.keys.call(this)
    }
    if (!keys || !config) { return }
    this._keys_id = keys.add(config)
  },

  _unregisterKeys: function (kid) {
    if (!this.props.keys || !kid) { return }
    this.props.keys.remove(kid)
  },

  componentDidMount: function () {
    this._registerKeys()
  },
  componentWillUnmount: function () {
    this._unregisterKeys(this._keys_id)
    delete this._keys_id
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.keys !== this.props.keys) {
      this._unregisterKeys(this._keys_id)
      delete this._keys_id
      this._registerKeys(nextProps.keys)
    }
  }
}

