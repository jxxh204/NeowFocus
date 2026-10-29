import type { BrowserWindow } from 'electron'

const keepWindowAboveApps = (mainWindow: BrowserWindow): void => {
  // Floating panels stay above app content but below Dock and system menus.
  mainWindow.setAlwaysOnTop(true, 'floating')
}

export const handleWindow = (mainWindow: BrowserWindow): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // `type: panel` supplies the nonactivating native window. Keep the
    // application foreground-capable so its Dock icon remains available.
    mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: true
    })

    keepWindowAboveApps(mainWindow)

    if (process.env.NODE_ENV === 'development') {
      console.log('Window settings applied:', {
        alwaysOnTop: mainWindow.isAlwaysOnTop(),
        visibleOnAllWorkspaces: mainWindow.isVisibleOnAllWorkspaces()
      })
    }
  }
}

export const revealWindow = (mainWindow: BrowserWindow): void => {
  if (!mainWindow || mainWindow.isDestroyed()) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  keepWindowAboveApps(mainWindow)
  // BrowserWindow.show() activates the whole app and can leave the current
  // full-screen Space. A panel can accept keyboard input without that switch.
  if (process.platform === 'darwin') mainWindow.showInactive()
  else mainWindow.show()
  mainWindow.focus()
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
  if (!mainWindow || mainWindow.isDestroyed()) return
  const position = getWindowPosition(tray, mainWindow) as { x; y }
  if (position) mainWindow?.setPosition(position?.x, position?.y, false)
  revealWindow(mainWindow)
}
