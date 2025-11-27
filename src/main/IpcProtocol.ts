import { ipcMain, app } from 'electron'

export const windowSizeChange = (mainWindow): void => {
  ipcMain.on('WINDOW_SIZE_CHANGE', (_e: Electron.IpcMainEvent, size) => {
    const bounds = mainWindow?.getBounds()

    // size가 객체인 경우 (width, height 모두 변경)
    if (typeof size === 'object' && size !== null) {
      const newBounds: { width?: number; height?: number } = {}
      if (size.width !== undefined && bounds.width !== size.width) {
        newBounds.width = size.width
      }
      if (size.height !== undefined && bounds.height !== size.height) {
        newBounds.height = size.height
      }
      if (Object.keys(newBounds).length > 0) {
        mainWindow.setBounds(newBounds)
      }
    }
    // size가 숫자인 경우 (height만 변경, 기존 동작 유지)
    else if (typeof size === 'number' && bounds.height !== size) {
      mainWindow.setBounds({ height: size })
    }
  })
}

export const notificationProtocol = (): void => {
  ipcMain.on('SHOW_NOTIFICATION', (_e: Electron.IpcMainEvent, { title, body }) => {
    const { Notification } = require('electron')
    if (Notification.isSupported()) {
      new Notification({
        title: title,
        body: body,
        silent: false
      }).show()
    }
  })
}

export const showWindowProtocol = (mainWindow): void => {
  ipcMain.on('SHOW_WINDOW', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

export const getSystemLocaleProtocol = (): void => {
  ipcMain.handle('GET_SYSTEM_LOCALE', () => {
    const locale = app.getLocale()
    // ko, en, ja 등에서 ko -> ko, en -> en으로 변환
    return locale.startsWith('ko') ? 'ko' : 'en'
  })
}

export const navigateToProtocol = (mainWindow: Electron.BrowserWindow): void => {
  ipcMain.on('NAVIGATE_TO', (_e: Electron.IpcMainEvent, route: string) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('NAVIGATE_TO', route)
      mainWindow.show()
      mainWindow.focus()
    }
  })
}
