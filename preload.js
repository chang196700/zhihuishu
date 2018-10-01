const path = require('path')
const {ipcRenderer} = require('electron')

window.__app = {
    __dirname: __dirname
}

window.noderequire = window.require;
delete window.require;
delete window.exports;
delete window.module;

function completed() {
    document.removeEventListener('DOMContentLoaded', completed)
    window.removeEventListener('load', completed)

}

document.addEventListener('DOMContentLoaded', completed)
window.addEventListener('load', completed)

window.onerror = function (msg, url, lineNumber) {
    ipcRenderer.send('error', msg, url, lineNumber)
    // window.location.reload()
    return false
}
