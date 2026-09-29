import { Menu, app, nativeImage, dialog, BrowserWindow } from 'electron'
import path from 'path'
import { APP_INFO } from '../constants'
import { t } from '../i18n'

let mainWindowRef: BrowserWindow | null = null

export const setMainWindow = (window: BrowserWindow): void => {
  mainWindowRef = window
}

export const setupApplicationMenu = (): void => {
  // macOS 전용
  if (process.platform !== 'darwin') {
    // macOS가 아니면 메뉴바 완전 제거
    Menu.setApplicationMenu(null)
    return
  }

  // macOS는 최소한의 메뉴만 유지
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: APP_INFO.NAME,
      submenu: [
        {
          label: `${t('menu.about')} ${APP_INFO.NAME}`,
          click: () => {
            // 커스텀 정보 다이얼로그 표시
            const iconPath = app.isPackaged
              ? path.join(process.resourcesPath, 'icon.png')
              : path.join(__dirname, '../../build/icon.png')

            const icon = nativeImage.createFromPath(iconPath)

            dialog.showMessageBox({
              type: 'info',
              title: `${t('menu.aboutDialog.title')} ${APP_INFO.NAME}`,
              message: APP_INFO.NAME,
              detail: `${t('menu.aboutDialog.version')} ${app.getVersion()}\n\n${t('app.description')}`,
              icon: icon,
              buttons: [t('menu.aboutDialog.button')]
            })
          }
        },
        { type: 'separator' },
        {
          label: t('menu.preferences'),
          accelerator: 'Cmd+,',
          click: () => {
            if (mainWindowRef && !mainWindowRef.isDestroyed()) {
              mainWindowRef.webContents.send('NAVIGATE_TO', '/settings')
              mainWindowRef.show()
              mainWindowRef.focus()
            }
          }
        },
        { type: 'separator' },
        {
          label: t('menu.services'),
          role: 'services'
        },
        { type: 'separator' },
        {
          label: `${t('menu.hide')} ${APP_INFO.NAME}`,
          accelerator: 'Cmd+H',
          click: () => {
            app.hide()
          }
        },
        {
          label: t('menu.hideOthers'),
          accelerator: 'Cmd+Alt+H',
          role: 'hideOthers'
        },
        {
          label: t('menu.unhide'),
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: `${t('menu.quit')} ${APP_INFO.NAME}`,
          accelerator: 'Cmd+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: t('menu.edit'),
      submenu: [
        { label: t('menu.undo'), accelerator: 'Cmd+Z', role: 'undo' },
        { label: t('menu.redo'), accelerator: 'Shift+Cmd+Z', role: 'redo' },
        { type: 'separator' },
        { label: t('menu.cut'), accelerator: 'Cmd+X', role: 'cut' },
        { label: t('menu.copy'), accelerator: 'Cmd+C', role: 'copy' },
        { label: t('menu.paste'), accelerator: 'Cmd+V', role: 'paste' },
        { label: t('menu.selectAll'), accelerator: 'Cmd+A', role: 'selectAll' }
      ]
    },
    {
      label: t('menu.window'),
      submenu: [
        { label: t('menu.minimize'), accelerator: 'Cmd+M', role: 'minimize' },
        { label: t('menu.zoom'), role: 'zoom' },
        { label: t('menu.close'), accelerator: 'Cmd+W', role: 'close' },
        { type: 'separator' },
        { label: t('menu.front'), role: 'front' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
