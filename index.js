'use strict'

const makeServer = require('./electron/server')
const google = require('./electron/google')
const MemDB = require('./treed/pl/mem')

const {app, BrowserWindow, ipcMain} = require('electron')


let mainWindow
function createWindow (port) {
  mainWindow = new BrowserWindow({width: 1200, height: 1000, 
    "web-preferences": {
      "web-security": false
    }
  })
  //mainWindow.loadURL(`file://${__dirname}/www/index.html`)
  mainWindow.loadURL(`http://localhost:${port}/electron.html`)
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  // BrowserWindow.addDevToolsExtension('/Users/jared/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.14.11_0')
}

app.on('ready', () => makeServer(port => {
  createWindow(port)
}));


app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('google-login', (event) => {
  console.log('ipc google login');
  google((err, result) => {
    console.log('res', err, result);
    event.sender.send('google-token', result);
  })
});

const dbs = {}
const initDb = prefix => {
  return new MemDB({prefix})
}

const handleTx = (action, prefix, args, done) => {
  if (!dbs[prefix]) {
    dbs[prefix] = initDb(prefix)
  }
  dbs[prefix][action](...args, done)
}

ipcMain.on('db:tx', (event, txid, prefix, action, args) => {
  console.log('db:tx', action, args)
  handleTx(action, prefix, args, (...results) => {
    event.sender.send('db:tx', txid, ...results)
  })
})

/*
ipcMain.on('db:find-all', (event, txid, type) => {
  event.sender.send('db:tx', txid, null, [])
})

ipcMain.on('db:save', (event, txid, type, id, value) => {
  event.sender.send('db:tx', txid)
});

ipcMain.on('db:set', (event, txid, type, id, attr, value) => {
  event.sender.send('db:tx', txid)
});

ipcMain.on('db:batch-save', (event, txid, type, nodes) => {
  event.sender.send('db:tx', txid)
});

ipcMain.on('db:batch-set', (event, txid, type, ids, values) => {
  event.sender.send('db:tx', txid)
});

ipcMain.on('db:update', (event, txid, type, id, update) => {
  event.sender.send('db:tx', txid)
});

ipcMain.on('db:remove', (event, txid, type, id) => {
  event.sender.send('db:tx', txid)
});
*/
