const config = require('./secrets').google;
const electronGoogleOauth = require('./goog-help')

const browserWindowParams = {
    'use-content-size': true,
    center: true,
    show: false,
    resizable: false,
    'always-on-top': true,
    'standard-window': true,
    'auto-hide-menu-bar': true,
    'node-integration': false
};

const googleOauth = electronGoogleOauth(browserWindowParams);

module.exports = (cb) => {
  googleOauth.getAuthorizationCode(
    ['https://www.googleapis.com/auth/drive'],
    config.clientId,
    config.clientSecret,
    config.redirect
  ).then(result => {
    cb(null, result)
  }, error => {
    cb(error)
  });
}
