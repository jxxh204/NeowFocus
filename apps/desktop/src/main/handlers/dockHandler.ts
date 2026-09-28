import { Menu, BrowserWindow, app, nativeImage } from 'electron'
import { join } from 'path'
import { t } from '../i18n'

export const createDockMenu = (mainWindow: BrowserWindow): void => {
  // macOS 전용
  if (process.platform !== 'darwin') {
    return
  }

  const dockMenu = Menu.buildFromTemplate([
    {
      label: t('dock.show'),
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
      label: t('dock.hide'),
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
      label: t('dock.quit'),
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
