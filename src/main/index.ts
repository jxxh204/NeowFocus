import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { handleWindow, showWindow } from './handlers/windowHandler'
import { createTray } from './handlers/trayhandler'
import { windowSizeChange } from './IpcProtocol'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 384,
    height: 60,
    minHeight: 60,
    maxHeight: 900,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    darkTheme: false,
    // movable: true,
    transparent: false,
    icon: join(__dirname, '../../build/icon.png'),
    vibrancy: 'popover',
    visualEffectState: 'followWindow',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true,
      nodeIntegration: true,
      backgroundThrottling: false,
      contextIsolation: true
    },
    alwaysOnTop: true
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  setDevTools(mainWindow)
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
  mainWindow.once('show', () => {
    showWindow(tray, mainWindow)
  })
  mainWindow?.isDestroyed()
  // mouseIpcProtocol(mainWindow)
  windowSizeChange(mainWindow)
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

    // mainWindow.webContents.send('browser-window-focus')
  })
  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+W')
    globalShortcut.unregister('CommandOrControl+R')
    globalShortcut.unregister('F5')
    mainWindow.webContents.send('browser-window-blur')
  })

  // Handle window dragging
  ipcMain.on('window-move', (_event, { deltaX, deltaY }) => {
    const [currentX, currentY] = mainWindow.getPosition()
    mainWindow.setPosition(currentX + deltaX, currentY + deltaY)
  })

  // Set window position absolutely
  ipcMain.on('window-set-position', (_event, { x, y }) => {
    mainWindow.setPosition(x, y)
  })

  // Get window position
  ipcMain.handle('window-get-position', () => {
    const [x, y] = mainWindow.getPosition()
    return { x, y }
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const setDevTools = (mainWindow: BrowserWindow) => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' }) // DevTools를 엽니다.
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
