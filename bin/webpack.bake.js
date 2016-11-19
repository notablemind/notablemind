var path = require('path');

module.exports = {

  resolve: {
    alias: {
      itreed: path.join(__dirname, '..', 'itreed'),
      treed: path.join(__dirname, '..', 'treed'),
      react: path.join(__dirname, '..', 'node_modules', 'react'),
    },
  },

}
