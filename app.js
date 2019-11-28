require('update-electron-app')({
    repo: 'chang196700/zhihuishu'
})
const {app, BrowserWindow, Menu, Tray, Notification, ipcMain, globalShortcut, session} = require('electron')
const store = new (require('electron-store'))
const fs = require('fs')
const path = require('path')
const i18n = require('i18n')

const sessionCookiesKey = 'chang196700.zhihuishu.cookies'

// const regVideo = /^http(s?):\/\/study\.zhihuishu\.com\/learning\/videoList/

let tray = null
let win = null

let i18n_config = {
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en'
}

i18n.configure(i18n_config)

function createWindow () {
    win = new BrowserWindow({
        // show: false,
        width: 1240,
        height: 960,
        backgroundColor: '#FFFFFF',
        // frame: false,
        // transparent: true,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.maximize()

    //win.loadURL('https://passport.zhihuishu.com/login?service=http://www.zhihuishu.com/')
    win.loadURL('https://www.zhihuishu.com/')

    // loadCookies();
    
    win.on('close', () => {
        // saveCookies();
    })

    win.on('closed', () => {
        win = null
        app.quit()
    })

    win.webContents.on('dom-ready', () => {
        // if (regVideo.test(win.getURL())) {
        //     win.webContents.executeJavaScript('const path = noderequire("path"); \
        //         noderequire(path.join(__app.__dirname, "inject.js"))', true)
        // }
    })

    win.webContents.on('did-finish-load', () => {
    })

    win.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        win.loadURL(url)
    })
}

app.on('ready', () => {
    i18n.setLocale(app.getLocale())
    
    let trayMenu = Menu.buildFromTemplate([
        {
            label: i18n.__('Show/Hide'),
            click: function () {
                if (win) {
                    if (win.isVisible()) {
                        win.hide()
                    } else {
                        win.show()
                    }
                }
            }
        }, {
            label: i18n.__('Mute'),
            type: 'checkbox',
            click: function (menuItem) {
                win && win.webContents.setAudioMuted(menuItem.checked)
            }
        }, {
            label: i18n.__('Quit'),
            role: 'quit'
        }
    ])
    tray = new Tray(path.join(__dirname, 'icon.png'))
    tray.setToolTip(i18n.__('Zhihuishu'))
    tray.setContextMenu(trayMenu)

    let appMenu = Menu.buildFromTemplate([
        {
            label: i18n.__('File'),
            submenu: [
                {
                    label: i18n.__('Quit'),
                    role: 'quit'
                }
            ]
        }, {
            label: i18n.__('Hide'),
            click: function (menuItem, browserWindow) {
                browserWindow.hide()
            }
        }, {
            label: i18n.__('Help'),
            submenu: [
                {
                    label: i18n.__('Toggle DevTools'),
                    role: 'toggledevtools'
                }
            ]
        }
    ])

    Menu.setApplicationMenu(appMenu)

    globalShortcut.register('CmdOrCtrl+I', () => {
        win && win.webContents.toggleDevTools()
    })

    createWindow();
})

function onshownotice(event, title, body, isToggle) {
    if (Notification.isSupported()) {
        let notice = new Notification({
            title: title,
            body: body
        })
        if (isToggle) {
            notice.on('click', () => {
                if (!win.isVisible()) {
                    win.show()
                }
            })
        }
        notice.show()
    }
}

ipcMain.on('shownotice', onshownotice)

ipcMain.on('error', (event, msg, url, lineNumber) => {
    // let notice = new Notification({
    //     title: 'Error',
    //     body: 'Message: ' + msg + ', URL: ' + url + ', line: ' + lineNumber,
    // })
    // notice.on('click', () => {
    //     win.show()
    //     win.webContents.openDevTools()
    // })
    // notice.show()
})

ipcMain.on('geti18n', (event) => {
    event.returnValue = {i18n_config, locale: app.getLocale()}
})

// function saveCookies() {
//     if (win) {
//         win.webContents.session.cookies.get({})
//             .then((cookies) => {
//                 store.set(sessionCookiesKey, cookies);
//             })
//             .catch((error) => {
//                 console.log(error)
//             })
//     }
// }

// function loadCookies() {
//     if (win) {
//         let cookies = store.get(sessionCookiesKey) || []
//         if (cookies.length <= 0) {
//             return
//         }
//         cookies.forEach((cookie) => {
//             let {
//                 secure = false,
//                 domain = '',
//                 path = ''
//             } = cookie
//             win.webContents.session.cookies
//                 .set(
//                     Object.assign(cookie, {
//                         url: (secure ? 'https://' : 'http://') + domain.replace(/^\./, '') + path
//                     })
//                 )
//                 .then(() => {})
//                 .catch((e) => {
//                     console.error(e)
//                 })
//         })
//     }
// }
