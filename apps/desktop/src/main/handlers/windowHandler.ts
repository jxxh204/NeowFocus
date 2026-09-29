import { BrowserWindow } from 'electron'

export const handleWindow = (mainWindow: BrowserWindow): void => {
  if (mainWindow) {
    // 전체화면 앱 위에 표시하기 위한 설정
    // skipTransformProcessType을 사용하여 Dock 숨김 현상 방지
    mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: true
    })

    // 가장 높은 레벨로 항상 최상위 설정
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)

    // 전체화면 작동을 위해 윈도우를 강제로 다시 focus
    // Electron 버그 우회: https://github.com/electron/electron/issues/36364
    setTimeout(() => {
      mainWindow.focus()
      mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    }, 100)

    if (process.env.NODE_ENV === 'development') {
      console.log('Window settings applied:', {
        alwaysOnTop: mainWindow.isAlwaysOnTop(),
        visibleOnAllWorkspaces: mainWindow.isVisibleOnAllWorkspaces()
      })
    }
  }
}

const getWindowPosition = (tray, mainWindow): void | object => {
  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const windowBounds = mainWindow?.getBounds()

  if (!windowBounds) return

  if (tray) {
    const trayBounds = tray.getBounds()

    // trayBounds가 유효한지 확인 (x, y가 화면 범위 내에 있는지)
    const isTrayBoundsValid =
      trayBounds &&
      trayBounds.x >= 0 &&
      trayBounds.y >= 0 &&
      trayBounds.x < width &&
      trayBounds.y < height &&
      trayBounds.width > 0 &&
      trayBounds.height > 0

    if (isTrayBoundsValid) {
      // Center window horizontally below the tray icon
      const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)

      // Position window 4 pixels vertically below the tray icon
      const y = Math.round(trayBounds.y + trayBounds.height + 4)

      console.log('Positioning window below tray:', { x, y, trayBounds })
      return { x, y }
    }

    console.log('Invalid tray bounds, using center position:', trayBounds)
  }

  // Tray가 없거나 Tray bounds가 유효하지 않을 경우 화면 중앙에 배치
  const x = Math.round((width - windowBounds.width) / 2)
  const y = Math.round((height - windowBounds.height) / 2)

  console.log('Positioning window at center:', { x, y })
  return { x, y }
}

export const showWindow = (tray, mainWindow: BrowserWindow): void => {
  const position = getWindowPosition(tray, mainWindow) as { x; y }
  if (position) mainWindow?.setPosition(position?.x, position?.y, false)
  mainWindow?.show()
  mainWindow?.focus()
}
