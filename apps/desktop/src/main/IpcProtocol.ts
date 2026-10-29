import { ipcMain, app } from 'electron'
import { handleWindow, revealWindow } from './handlers/windowHandler'
import { WINDOW_SIZE } from './constants'

// 슈퍼포커스: 작은 창을 macOS 전체화면(자기 Space)으로 띄운다. 이 동안은 항상 위에 두지 않는다.
// 끄거나 사용자가 전체화면을 빠져나오면 원래 자리와 크기, 항상 위 설정으로 되돌린다.
export const superFocusProtocol = (mainWindow: Electron.BrowserWindow): void => {
  let restoreBounds: Electron.Rectangle | null = null
  // 전체화면 전환은 애니메이션 동안 다른 요청을 받지 않는다. 마지막으로 원한 상태를 기억해 두고 전환이 끝나면 맞춘다
  let wanted = false
  let entering = false
  let leavingByApp = false

  const restoreSmallWindow = () => {
    if (!restoreBounds) return
    const previous = restoreBounds
    restoreBounds = null
    mainWindow.setFullScreenable(false)
    mainWindow.setResizable(false)
    mainWindow.setMaximumSize(0, WINDOW_SIZE.MAX_HEIGHT)
    mainWindow.setBounds(previous)
    handleWindow(mainWindow)
  }

  const enterFullScreen = () => {
    entering = true
    mainWindow.show()
    mainWindow.focus()
    mainWindow.setFullScreen(true)
  }

  const leaveFullScreen = () => {
    leavingByApp = true
    mainWindow.setFullScreen(false)
  }

  mainWindow.on('enter-full-screen', () => {
    entering = false
    if (restoreBounds && !wanted) leaveFullScreen()
  })

  mainWindow.on('leave-full-screen', () => {
    if (!restoreBounds) return
    if (leavingByApp) {
      leavingByApp = false
      if (wanted) enterFullScreen()
      else restoreSmallWindow()
      return
    }
    // 녹색 버튼이나 ⌃⌘F로 빠져나오면 화면도 작은 창으로 돌려보낸다
    wanted = false
    restoreSmallWindow()
    mainWindow.webContents.send('SUPER_FOCUS_EXITED')
  })

  ipcMain.on('SUPER_FOCUS', (_e: Electron.IpcMainEvent, enabled: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    wanted = enabled
    if (enabled) {
      if (!restoreBounds) {
        restoreBounds = mainWindow.getBounds()
        mainWindow.setAlwaysOnTop(false)
        mainWindow.setVisibleOnAllWorkspaces(false)
        // 0은 제한 없음
        mainWindow.setMaximumSize(0, 0)
        mainWindow.setResizable(true)
        mainWindow.setFullScreenable(true)
      }
      // 빠져나오는 중이면 끝난 뒤 다시 들어간다
      if (!entering && !leavingByApp && !mainWindow.isFullScreen()) enterFullScreen()
    } else {
      if (!restoreBounds || entering || leavingByApp) return
      if (mainWindow.isFullScreen()) leaveFullScreen()
      else restoreSmallWindow()
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
