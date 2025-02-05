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
    if (bounds.height !== size) mainWindow.setBounds({ height: size })
  })
}
