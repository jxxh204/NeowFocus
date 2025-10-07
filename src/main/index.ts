import { app, shell, BrowserWindow, ipcMain, globalShortcut, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { handleWindow, showWindow } from './handlers/windowHandler'
import { createTray } from './handlers/trayhandler'
import { createDockMenu } from './handlers/dockHandler'
import { windowSizeChange, notificationProtocol, showWindowProtocol } from './IpcProtocol'
import { WINDOW_SIZE, APP_CONFIG, WINDOW_OPTIONS, SHORTCUTS, IPC_CHANNELS } from './constants'

function createWindow(): BrowserWindow {
  // Force dark mode
  nativeTheme.themeSource = APP_CONFIG.THEME

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: WINDOW_SIZE.DEFAULT_WIDTH,
    height: WINDOW_SIZE.DEFAULT_HEIGHT,
    minHeight: WINDOW_SIZE.MIN_HEIGHT,
    maxHeight: WINDOW_SIZE.MAX_HEIGHT,
    hasShadow: WINDOW_OPTIONS.HAS_SHADOW,
    frame: WINDOW_OPTIONS.FRAME,
    fullscreenable: WINDOW_OPTIONS.FULLSCREENABLE,
    resizable: WINDOW_OPTIONS.RESIZABLE,
    darkTheme: WINDOW_OPTIONS.DARK_THEME,
    // movable: true,
    transparent: WINDOW_OPTIONS.TRANSPARENT,
    icon: join(__dirname, APP_CONFIG.ICON_PATH),
    vibrancy: APP_CONFIG.VIBRANCY,
    visualEffectState: APP_CONFIG.VISUAL_EFFECT_STATE,
    webPreferences: {
      preload: join(__dirname, APP_CONFIG.PRELOAD_PATH),
      sandbox: WINDOW_OPTIONS.SANDBOX,
      devTools: WINDOW_OPTIONS.DEV_TOOLS,
      nodeIntegration: WINDOW_OPTIONS.NODE_INTEGRATION,
      backgroundThrottling: WINDOW_OPTIONS.BACKGROUND_THROTTLING,
      contextIsolation: WINDOW_OPTIONS.CONTEXT_ISOLATION
    },
    alwaysOnTop: WINDOW_OPTIONS.ALWAYS_ON_TOP
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
  const tray = createTray(mainWindow)
  tray.on('click', toggleWindow)
  tray.on('double-click', toggleWindow)
  mainWindow.once('show', () => {
    showWindow(tray, mainWindow)
  })
  mainWindow?.isDestroyed()
  // mouseIpcProtocol(mainWindow)
  windowSizeChange(mainWindow)
  notificationProtocol()
  showWindowProtocol(mainWindow)

  // Dock 메뉴 설정
  createDockMenu(mainWindow)

  // Window minimize handler - use hide() instead of minimize() to prevent app quit on macOS
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
  })

  return mainWindow
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId(APP_CONFIG.USER_MODEL_ID)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on(IPC_CHANNELS.PING, () => console.log('pong'))

  const mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('browser-window-focus', () => {
    globalShortcut.register(SHORTCUTS.CLOSE_WINDOW, () => {
      // Prevent the default behavior
      console.log(`${SHORTCUTS.CLOSE_WINDOW} is disabled`)
    })
    //mac
    globalShortcut.register(SHORTCUTS.RELOAD, () => {
      console.log(`${SHORTCUTS.RELOAD} is pressed: Shortcut Disabled`)
    })
    //window
    globalShortcut.register(SHORTCUTS.REFRESH, () => {
      console.log(`${SHORTCUTS.REFRESH} is pressed: Shortcut Disabled`)
    })

    // mainWindow.webContents.send('browser-window-focus')
  })
  app.on('browser-window-blur', () => {
    globalShortcut.unregister(SHORTCUTS.CLOSE_WINDOW)
    globalShortcut.unregister(SHORTCUTS.RELOAD)
    globalShortcut.unregister(SHORTCUTS.REFRESH)
    mainWindow.webContents.send(IPC_CHANNELS.BROWSER_WINDOW_BLUR)
  })

  // Handle window dragging
  ipcMain.on(IPC_CHANNELS.WINDOW_MOVE, (_event, { deltaX, deltaY }) => {
    const [currentX, currentY] = mainWindow.getPosition()
    mainWindow.setPosition(currentX + deltaX, currentY + deltaY)
  })

  // Set window position absolutely
  ipcMain.on(IPC_CHANNELS.WINDOW_SET_POSITION, (_event, { x, y }) => {
    mainWindow.setPosition(x, y)
  })

  // Get window position
  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_POSITION, () => {
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
    mainWindow.loadFile(join(__dirname, APP_CONFIG.RENDERER_PATH))
  }
}
