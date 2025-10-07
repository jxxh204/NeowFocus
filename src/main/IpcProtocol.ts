import { ipcMain } from 'electron'
import { MouseMove } from '../renderer/src/types/interface'

// 제거
export const mouseIpcProtocol = (mainWindow): void => {
  let _mouseDiffX
  let _mouseDiffY

  ipcMain.on('MOUSE_MOVE', (_e: Electron.IpcMainEvent, { mouseX, mouseY }: MouseMove) => {
    const newX = mouseX - _mouseDiffX
    const newY = mouseY - _mouseDiffY

    mainWindow.setPosition(newX, newY, false)
  })
  ipcMain.on('MOUSE_DOWN', (_e: Electron.IpcMainEvent, { mouseX, mouseY }: MouseMove) => {
    const bounds = mainWindow?.getBounds()
    if (bounds) {
      _mouseDiffX = mouseX - bounds.x // 처음 마우스가 클릭된 위치
      _mouseDiffY = mouseY - bounds.y
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
