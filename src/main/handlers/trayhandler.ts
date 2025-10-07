import { nativeImage, Tray, Menu, BrowserWindow, app } from 'electron'
import path from 'path'

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
