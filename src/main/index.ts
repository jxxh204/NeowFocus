import { app, shell, BrowserWindow, ipcMain, screen, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { handleWindow, showWindow } from './windowHandler'
import { createTray } from './trayhandler'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    minHeight: 50,
    maxHeight: 900,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    darkTheme: false,
    // movable: true,
    transparent: false,
    icon: join(__dirname, icon),
    // backgroundColor: "white",
    vibrancy: 'popover', // in my case...
    visualEffectState: 'followWindow',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true,
      nodeIntegration: true,
      backgroundThrottling: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' }) // DevTools를 엽니다.
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  handleWindow(mainWindow)
  const toggleWindow = () => {
    if (mainWindow?.isVisible()) {
      mainWindow?.hide()
    } else {
      showWindow(tray, mainWindow)
    }
  }
  const tray = createTray()
  tray.on('double-click', toggleWindow)
  tray.on('click', toggleWindow)
  mainWindow?.webContents.once('dom-ready', () => {
    showWindow(tray, mainWindow)
  })
  mainWindow?.isDestroyed()
  // mouseIpcProtocol(mainWindow)
  //   tray.on('right-click', showMenu)
  return mainWindow
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+W', () => {
      // Prevent the default behavior
      console.log('CommandOrControl+W is disabled')
    })
    //mac
    globalShortcut.register('CommandOrControl+R', () => {
      console.log('CommandOrControl+R is pressed: Shortcut Disabled')
    })
    //window
    globalShortcut.register('F5', () => {
      console.log('F5 is pressed: Shortcut Disabled')
    })

    mainWindow.webContents.send('browser-window-focus')
  })
  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+W')
    globalShortcut.unregister('CommandOrControl+R')
    globalShortcut.unregister('F5')
    mainWindow.webContents.send('browser-window-blur')
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
