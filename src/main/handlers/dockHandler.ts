import { Menu, BrowserWindow, app, nativeImage } from 'electron'
import { join } from 'path'

export const createDockMenu = (mainWindow: BrowserWindow): void => {
  // macOS 전용
  if (process.platform !== 'darwin') {
    return
  }

  const dockMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          console.log('Window was destroyed, cannot show')
          return
        }
        mainWindow.show()
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }
    },
    {
      label: 'Hide',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          console.log('Window was destroyed, cannot hide')
          return
        }
        mainWindow.hide()
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  app.dock.setMenu(dockMenu)

  // Dock 아이콘 항상 표시
  app.dock.show()

  // Dock 아이콘 설정
  const iconPath = join(__dirname, '../../build/icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  app.dock.setIcon(icon)
}
