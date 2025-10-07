import { BrowserWindow } from 'electron'

export const handleWindow = (mainWindow: BrowserWindow): void => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
  }
}

const getWindowPosition = (tray, mainWindow): void | object => {
  if (tray) {
    const windowBounds = mainWindow?.getBounds()
    const trayBounds = tray.getBounds()

    // Center window horizontally below the tray icon
    if (windowBounds) {
      const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)

      // Position window 4 pixels vertically below the tray icon
      const y = Math.round(trayBounds.y + trayBounds.height + 4)

      return { x: x, y: y }
    }
  }

  // Tray가 없을 경우 화면 중앙에 배치
  if (mainWindow) {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    const windowBounds = mainWindow.getBounds()

    const x = Math.round((width - windowBounds.width) / 2)
    const y = Math.round((height - windowBounds.height) / 2)

    return { x, y }
  }
}

export const showWindow = (tray, mainWindow: BrowserWindow): void => {
  const position = getWindowPosition(tray, mainWindow) as { x; y }
  if (position) mainWindow?.setPosition(position?.x, position?.y, false)
  mainWindow?.show()
  mainWindow?.focus()
}
