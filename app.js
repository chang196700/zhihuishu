const {app, BrowserWindow, Menu, Tray, Notification, ipcMain} = require('electron')
const fs = require('fs')
const path = require('path')

const regVideo = /^http(s?):\/\/study\.zhihuishu\.com\/learning\/videoList/

let tray = null
let win = null

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

    win.setMenu(null)

    win.maximize()

    win.loadURL('https://passport.zhihuishu.com/login?service=http://online.zhihuishu.com/onlineSchool/')

    win.on('closed', () => {
        win = null
    })

    win.webContents.on('dom-ready', () => {
        if (regVideo.test(win.getURL()))
        {
            win.webContents.executeJavaScript('noderequire(\'' + path.join(__dirname, 'inject.js') + '\')', true)
        }

    })

    win.webContents.on('did-finish-load', () => {
    })

    win.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        win.loadURL(url)
    })
}

app.on('ready', () => {
    let contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show/Hide',
            type: 'normal',
            click: function () {
                if (win) {
                    if (win.isVisible()) {
                        win.hide()
                    } else {
                        win.show()
                    }
                }
            }
        },
        {
            label: 'Exit',
            type: 'normal',
            role: 'quit'
        }
    ])
    tray = new Tray('./icon.png')
    tray.setToolTip('Zhihuishu')
    tray.setContextMenu(contextMenu)
    createWindow();
})

function onshownotice(event, title, body, isToggle) {
    if (Notification.isSupported())
    {
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
