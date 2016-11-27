// This is not bundled

console.log('ho')
const {ipcRenderer} = require('electron')
ipcRenderer.sendToHost('hello')
window.addEventListener('contextmenu', e => {
  console.log('menuuu')

  ipcRenderer.sendToHost('menuuu')
})
window.addEventListener('click', e => {
  if (e.target.href) {
    if (e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      ipcRenderer.sendToHost({type: 'link meta click', href: e.target.href})
    } else {
      e.preventDefault()
      e.stopPropagation()
      ipcRenderer.sendToHost({type: 'link click', href: e.target.href})
    }
  }
})
