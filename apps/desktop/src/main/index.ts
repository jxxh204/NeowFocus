import { registerFocusCloud, playDesktopCompletionFeedback } from './focusCloud'
import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  nativeTheme,
  clipboard
} from 'electron'
import { BrowserBlockingBridge } from './browserBlocking'
import type { BrowserSettings, BrowserFocus } from '../shared/browserBlocking'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { handleWindow, showWindow } from './handlers/windowHandler'
import { createTray } from './handlers/trayhandler'
import { createDockMenu } from './handlers/dockHandler'
import { setupApplicationMenu, setMainWindow } from './handlers/menuHandler'
import { initI18n } from './i18n'
import {
  windowSizeChange,
  notificationProtocol,
  showWindowProtocol,
  getSystemLocaleProtocol,
  navigateToProtocol
} from './IpcProtocol'
import {
  WINDOW_SIZE,
  APP_CONFIG,
  WINDOW_OPTIONS,
  SHORTCUTS,
  IPC_CHANNELS,
  APP_INFO
} from './constants'

// 앱 종료 플래그
let isQuitting = false
let browserBlocking: BrowserBlockingBridge
if (process.env.NEOWFOCUS_TEST_USER_DATA)
  app.setPath('userData', process.env.NEOWFOCUS_TEST_USER_DATA)

function createWindow(): { mainWindow: BrowserWindow; tray: Electron.Tray } {
  // Force dark mode
  nativeTheme.themeSource = APP_CONFIG.THEME

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // A nonactivating macOS panel can join another app's full-screen Space
    // without hiding this app's Dock icon or changing the renderer's design.
    ...(process.platform === 'darwin' ? { type: 'panel' } : {}),
    width: WINDOW_SIZE.DEFAULT_WIDTH,
    height: WINDOW_SIZE.DEFAULT_HEIGHT,
    minHeight: WINDOW_SIZE.MIN_HEIGHT,
    maxHeight: WINDOW_SIZE.MAX_HEIGHT,
    show: false,
    title: APP_INFO.NAME, // 창 제목 설정
    hasShadow: WINDOW_OPTIONS.HAS_SHADOW,
    frame: WINDOW_OPTIONS.FRAME,
    fullscreenable: WINDOW_OPTIONS.FULLSCREENABLE,
    resizable: WINDOW_OPTIONS.RESIZABLE,
    darkTheme: WINDOW_OPTIONS.DARK_THEME,
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

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  setDevTools(mainWindow)
  handleWindow(mainWindow)
  const tray = createTray(mainWindow)
  const toggleWindow = () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      console.log('Window was destroyed, cannot toggle')
      return
    }
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      showWindow(tray, mainWindow)
    }
  }
  tray.on('click', toggleWindow)
  tray.on('double-click', toggleWindow)

  mainWindow.webContents.on('did-finish-load', () => {
    showWindow(tray, mainWindow)
  })

  // Command+W 처리: 창을 닫지 않고 숨기기
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow?.isDestroyed()
  registerFocusCloud(mainWindow)
  const browserHandlers = {
    FOCUS_COMPLETION_FEEDBACK: () => playDesktopCompletionFeedback(),
    FOCUS_BROWSER_STATUS: () => browserBlocking.status(),
    FOCUS_BROWSER_SETTINGS: (_event: Electron.IpcMainInvokeEvent, value: BrowserSettings) =>
      browserBlocking.configure(value),
    FOCUS_BROWSER_PUBLISH: (_event: Electron.IpcMainInvokeEvent, value: BrowserFocus) => {
      browserBlocking.publish(value)
    },
    FOCUS_BROWSER_OPEN_EXTENSION: async () => {
      const error = await shell.openPath(
        app.isPackaged
          ? join(process.resourcesPath, 'chrome-extension')
          : join(app.getAppPath(), 'chrome-extension')
      )
      if (error) throw new Error(error)
    },
    FOCUS_BROWSER_COPY_CODE: () => {
      clipboard.writeText(browserBlocking.connectionCode())
    }
  }
  for (const [channel, handler] of Object.entries(browserHandlers)) {
    ipcMain.removeHandler(channel)
    ipcMain.handle(channel, (event, ...args) => {
      if (
        event.sender !== mainWindow.webContents ||
        event.senderFrame !== mainWindow.webContents.mainFrame
      )
        throw new Error('허용되지 않은 요청이에요.')
      return (handler as (...args: any[]) => unknown)(event, ...args)
    })
  }
  windowSizeChange(mainWindow)
  notificationProtocol()
  showWindowProtocol(mainWindow)
  getSystemLocaleProtocol()
  navigateToProtocol(mainWindow)

  createDockMenu(mainWindow)

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
  })

  return { mainWindow, tray }
}

app.whenReady().then(() => {
  browserBlocking = new BrowserBlockingBridge(app.getPath('userData'))
  browserBlocking.start()
  electronApp.setAppUserModelId(APP_CONFIG.USER_MODEL_ID)

  // i18n 초기화
  initI18n()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on(IPC_CHANNELS.PING, () => console.log('pong'))

  let { mainWindow, tray } = createWindow()

  // Application Menu 설정 (mainWindow 생성 후)
  setMainWindow(mainWindow)
  setupApplicationMenu()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      const result = createWindow()
      mainWindow = result.mainWindow
      tray = result.tray
    } else if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      // hide 상태에서 Dock 아이콘 클릭 시 창 다시 표시
      showWindow(tray, mainWindow)
    }
  })

  // 앱 종료 전 플래그 설정
  app.on('before-quit', () => {
    isQuitting = true
    void browserBlocking.stop()
  })

  app.on('browser-window-focus', () => {
    globalShortcut.register(SHORTCUTS.RELOAD, () => {
      console.log(`${SHORTCUTS.RELOAD} is pressed: Shortcut Disabled`)
    })
    globalShortcut.register(SHORTCUTS.REFRESH, () => {
      console.log(`${SHORTCUTS.REFRESH} is pressed: Shortcut Disabled`)
    })
  })
  app.on('browser-window-blur', () => {
    globalShortcut.unregister(SHORTCUTS.RELOAD)
    globalShortcut.unregister(SHORTCUTS.REFRESH)
    mainWindow.webContents.send(IPC_CHANNELS.BROWSER_WINDOW_BLUR)
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MOVE, (_event, { deltaX, deltaY }) => {
    const [currentX, currentY] = mainWindow.getPosition()
    mainWindow.setPosition(currentX + deltaX, currentY + deltaY)
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_SET_POSITION, (_event, { x, y }) => {
    mainWindow.setPosition(x, y)
  })

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
