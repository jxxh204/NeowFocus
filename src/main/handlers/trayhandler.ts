import { nativeImage, Tray, Menu, BrowserWindow, app } from 'electron'
import path from 'path'
import { t } from '../i18n'

export const createTray = (mainWindow: BrowserWindow): Tray => {
  // 프로덕션과 개발 환경에서 다른 경로 사용
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'tray.png')
    : path.join(__dirname, '../../resources/tray.png')

  let icon = nativeImage.createFromPath(iconPath)

  // 아이콘 크기 조정 (22x22가 macOS tray의 표준 크기)
  icon = icon.resize({ width: 17, height: 17 })

  // Template 이미지로 설정하여 다크/라이트 모드에서 자동으로 색상 반전
  icon.setTemplateImage(true)

  const tray = new Tray(icon)

  tray.setToolTip(t('app.displayName'))

  // 컨텍스트 메뉴 생성
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `${t('tray.show')} ${t('app.displayName')}`,
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
      label: t('tray.hide'),
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
      label: t('tray.dashboard'),
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          console.log('Window was destroyed, cannot open dashboard')
          return
        }
        mainWindow.webContents.send('NAVIGATE_TO', '/dashboard')
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: t('tray.settings'),
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          console.log('Window was destroyed, cannot open settings')
          return
        }
        mainWindow.webContents.send('NAVIGATE_TO', '/settings')
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('tray.quit'),
      click: () => {
        app.quit()
      }
    }
  ])

  // 오른쪽 클릭 시에만 컨텍스트 메뉴 표시 (macOS에서는 Ctrl+클릭도 포함)
  tray.on('right-click', (_event, bounds) => {
    // 메뉴가 창 뒤로 가지 않도록 창의 레벨을 잠시 낮춤
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
      const currentLevel = mainWindow.isAlwaysOnTop()
      mainWindow.setAlwaysOnTop(false)

      // 메뉴 표시
      tray.popUpContextMenu(contextMenu, bounds)

      // 메뉴가 닫힌 후 원래 레벨로 복구
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setAlwaysOnTop(currentLevel)
        }
      }, 100)
    } else {
      tray.popUpContextMenu(contextMenu, bounds)
    }
  })

  return tray
}
