'use strict'

const makeServer = require('./electron/server')
const google = require('./electron/google')

const {app, BrowserWindow, ipcMain} = require('electron')

let mainWindow
function createWindow (port) {
  mainWindow = new BrowserWindow({width: 1200, height: 1000})
  //mainWindow.loadURL(`file://${__dirname}/www/index.html`)
  mainWindow.loadURL(`http://localhost:${port}/electron.html`)
  mainWindow.on('closed', function () {
    mainWindow = null
  })
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
