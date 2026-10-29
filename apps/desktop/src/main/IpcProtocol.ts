import { ipcMain, app, screen } from 'electron'
import { revealWindow } from './handlers/windowHandler'
import { WINDOW_SIZE } from './constants'

// 슈퍼포커스: 작은 창을 화면 전체로 키웠다가, 끄면 원래 자리와 크기로 되돌린다
export const superFocusProtocol = (mainWindow: Electron.BrowserWindow): void => {
  let restoreBounds: Electron.Rectangle | null = null
  ipcMain.on('SUPER_FOCUS', (_e: Electron.IpcMainEvent, enabled: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    if (enabled) {
      if (restoreBounds) return
      restoreBounds = mainWindow.getBounds()
      const { bounds } = screen.getDisplayMatching(restoreBounds)
      // 0은 제한 없음. 메뉴 막대와 Dock 위까지 덮는다
      mainWindow.setMaximumSize(0, 0)
      mainWindow.setAlwaysOnTop(true, 'screen-saver')
      mainWindow.setBounds(bounds)
      revealWindow(mainWindow)
      mainWindow.setAlwaysOnTop(true, 'screen-saver')
    } else {
      if (!restoreBounds) return
      const previous = restoreBounds
      restoreBounds = null
      mainWindow.setMaximumSize(0, WINDOW_SIZE.MAX_HEIGHT)
      mainWindow.setBounds(previous)
      mainWindow.setAlwaysOnTop(true, 'floating')
    }
  })
}

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
        silent: true
      }).show()
    }
  })
}

export const showWindowProtocol = (mainWindow): void => {
  ipcMain.on('SHOW_WINDOW', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      revealWindow(mainWindow)
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
      revealWindow(mainWindow)
    }
  })
}
