import { BrowserWindow } from 'electron'

export const handleWindow = (mainWindow: BrowserWindow): void => {
  if (mainWindow) {
    // 항상 위
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    // 화면 변경하더라도 항상 위
    mainWindow.setVisibleOnAllWorkspaces(true)
    // 포커스를 잃었을 경우
    // mainWindow.on("blur", () => {
    //   mainWindow?.hide();
    // });
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
}

export const showWindow = (tray, mainWindow: BrowserWindow): void => {
  const position = getWindowPosition(tray, mainWindow) as { x; y }
  if (position) mainWindow?.setPosition(position?.x, position?.y, false)
  mainWindow?.show()
  mainWindow?.focus()
}
