const path = require('path')
const {ipcRenderer} = require('electron')
const i18n = require('i18n')

const regVideo = /^http(s?):\/\/study\.zhihuishu\.com\/learning(New)?\/videoList/

window.__app = {
    __dirname: __dirname
}

let i18n_config = ipcRenderer.sendSync('geti18n')

i18n_config.i18n_config.register = window

i18n.configure(i18n_config.i18n_config)
i18n.setLocale(i18n_config.locale)

window.noderequire = window.require;
delete window.require;
delete window.exports;
delete window.module;

function completed() {
    document.removeEventListener('DOMContentLoaded', completed)
    window.removeEventListener('load', completed)
    if (regVideo.test(window.location.href)) {
        require(path.join(__dirname, './inject'))
    }
}

document.addEventListener('DOMContentLoaded', completed)
window.addEventListener('load', completed)

window.onerror = function (msg, url, lineNumber) {
    ipcRenderer.send('error', msg, url, lineNumber)
    // window.location.reload()
    return false
}
