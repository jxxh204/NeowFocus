import { nativeImage, Tray } from 'electron'
import path = require('path')

export const createTray = (): Tray => {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../resources/tray.png'))
  // .resize({ width: 16, height: 16 })
  const tray = new Tray(icon)

  tray.setToolTip('This is my application.')

  return tray
}
