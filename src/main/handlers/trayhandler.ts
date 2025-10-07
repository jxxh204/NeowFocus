import { nativeImage, Tray, Menu, BrowserWindow, app } from 'electron'
import path from 'path'

export const createTray = (mainWindow: BrowserWindow): Tray => {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../resources/tray.png'))
  const tray = new Tray(icon)

  tray.setToolTip('냐우포커스')

  // 컨텍스트 메뉴 생성
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '냐우포커스 열기',
      click: () => {
        mainWindow.show()
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }
    },
    {
      type: 'separator'
    },
    {
      label: '종료',
      click: () => {
        app.quit()
      }
    }
  ])

  // 오른쪽 클릭 시에만 컨텍스트 메뉴 표시 (macOS에서는 Ctrl+클릭도 포함)
  tray.on('right-click', (_event, bounds) => {
    tray.popUpContextMenu(contextMenu, bounds)
  })

  return tray
}
