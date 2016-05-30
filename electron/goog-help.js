const google = require('googleapis');
const { stringify, parse } = require('querystring');
const fetch = require('node-fetch');
const OAuth2 = google.auth.OAuth2;
const {BrowserWindow} = require('electron');

function getAuthenticationUrl(scopes, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
  const oauth2Client = new OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  const url = oauth2Client.generateAuthUrl({
    //access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    response_type: 'token id_token',
    scope: scopes // If you only need one scope you can pass it as string
  });
  return url;
}

const getQuery = url => {
  const ix = url.indexOf('#')
  return parse(url.slice(ix + 1))// .split('#')[0])
}

function authorizeApp(url, browserWindowParams) {
  return new Promise( (resolve, reject) => {

    const win = new BrowserWindow(browserWindowParams || {'use-content-size': true });

    win.loadURL(url);

    win.on('closed', () => {
      reject(new Error('User closed the window'));
    });

    win.webContents.on('will-navigate', function (event, url) {
      // console.log('will nav', url, getQuery(url))
      resolve(getQuery(url))
      win.close()
    });

    win.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      // console.log('did red', oldUrl, newUrl, getQuery(newUrl))
      resolve(getQuery(newUrl))
      win.close()
    });
  });
}

module.exports = function electronGoogleOauth(browserWindowParams, httpAgent) {

  const exports = {
    getAuthorizationCode(scopes, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
      const url = getAuthenticationUrl(scopes, clientId, clientSecret, redirectUri);
      return authorizeApp(url, BrowserWindow, browserWindowParams);
    },

    getAccessToken(scopes, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
      return exports.getAuthorizationCode(scopes, clientId, clientSecret, redirectUri).then(authorizationCode => {

        // console.log('authcode', authorizationCode);
        const data = stringify({
          code: authorizationCode,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        });

        return fetch('https://accounts.google.com/o/oauth2/token', {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: data,
          agent: httpAgent
        }).then(res => res.json());
      });
    }

  };

  return exports;
}
