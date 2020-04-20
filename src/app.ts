import {app, BrowserWindow, Menu, Tray, Notification, MenuItem, globalShortcut, session, Cookie, CookiesSetDetails} from 'electron'
import * as Store from 'electron-store'
import * as path from 'path'
import * as i18n from 'i18n'
import * as fs from 'fs';

const cookieFile = "cookies.json"
const cookieStoreKey = 'cookie.zhihuishu'

let tray: Tray = null
let win: BrowserWindow = null
let store = new Store()

i18n.configure({
    directory: path.join(__dirname, '..', 'locales'),
    defaultLocale: 'en'
})

let trayMenu = Menu.buildFromTemplate([
    {
        label: i18n.__('Show/Hide'),
        click: () => {
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
        click: (menuIten: MenuItem) => {
            if (win) {
                win.webContents.setAudioMuted(menuIten.checked)
            }
        }
    }, {
        label: i18n.__('Quit'),
        role: 'quit'
    }
])

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
        click: (menuItem, browserWindow) => {
            browserWindow.hide()
        }
    }, {
        label: i18n.__('Help'),
        submenu: [
            {
                label: i18n.__('Toggle DevTools'),
                role: 'toggleDevTools'
            }
        ]
    }
])

let createWindow = () => {
    win = new BrowserWindow({
        width: 1240,
        height: 960,
        maximizable: true,
        backgroundColor: '#F',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadURL('https://www.zhihuishu.com/')
}

let loadCookies = (ses: session) => {
    let cookies = <Cookie[]>store.get(cookieStoreKey, [])

    if (cookies.length <= 0) {
        return
    }

    cookies.forEach(c => {
        Promise.resolve(c).then((c)=>{
            let cook: CookiesSetDetails = {
                url: `${c.secure ? "https://" : "http://"}${c.domain.replace(/^\./, '')}${c.path}`,
                name: c.name,
                value: c.value,
                domain: c.domain,
                path: c.path,
                secure: c.secure,
                httpOnly: c.httpOnly,
                expirationDate: c.expirationDate
            }
            return cook
        }).then((cook) => {
            return ses.cookies.set(cook)
        }).then(() => {
        }, (reason) => {
            console.log('reject: ' + reason)
        });
    });
}

let saveCookies = (ses: session) => {
    ses.cookies.get({
        domain: '.zhihuishu.com'
    }).then((cookies) => {
        store.set(cookieStoreKey, cookies)
    })
}

app.on('ready', () => {
    tray = new Tray(path.join(__dirname, '..', 'resources', 'logo.png'))
    tray.setToolTip(i18n.__('ZhiHuiShu'))
    tray.setContextMenu(trayMenu)
    
    Menu.setApplicationMenu(appMenu)

    globalShortcut.register('CmdOrCtrl+I', () => {
        win && win.webContents.toggleDevTools()
    })

    loadCookies(session.defaultSession)

    session.defaultSession.cookies.on('changed', () => {
        saveCookies(session.defaultSession)
    })

    createWindow()
})
