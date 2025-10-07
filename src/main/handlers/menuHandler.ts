import { Menu, app, shell, nativeImage, dialog } from 'electron'
import path from 'path'
import { APP_INFO } from '../constants'

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
          label: `${APP_INFO.NAME} 정보`,
          click: () => {
            // 커스텀 정보 다이얼로그 표시
            const iconPath = app.isPackaged
              ? path.join(process.resourcesPath, 'icon.png')
              : path.join(__dirname, '../../build/icon.png')

            const icon = nativeImage.createFromPath(iconPath)

            dialog.showMessageBox({
              type: 'info',
              title: `${APP_INFO.NAME} 정보`,
              message: APP_INFO.NAME,
              detail: `버전 ${app.getVersion()}\n\n${APP_INFO.DESCRIPTION}`,
              icon: icon,
              buttons: ['확인']
            })
          }
        },
        { type: 'separator' },
        {
          label: '환경설정...',
          accelerator: 'Cmd+,',
          enabled: false // 아직 구현 안됨
        },
        { type: 'separator' },
        {
          label: '서비스',
          role: 'services'
        },
        { type: 'separator' },
        {
          label: '가리기',
          accelerator: 'Cmd+H',
          role: 'hide'
        },
        {
          label: '기타 가리기',
          accelerator: 'Cmd+Alt+H',
          role: 'hideOthers'
        },
        {
          label: '모두 보기',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: '종료',
          accelerator: 'Cmd+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '편집',
      submenu: [
        { label: '실행 취소', accelerator: 'Cmd+Z', role: 'undo' },
        { label: '재실행', accelerator: 'Shift+Cmd+Z', role: 'redo' },
        { type: 'separator' },
        { label: '잘라내기', accelerator: 'Cmd+X', role: 'cut' },
        { label: '복사', accelerator: 'Cmd+C', role: 'copy' },
        { label: '붙여넣기', accelerator: 'Cmd+V', role: 'paste' },
        { label: '모두 선택', accelerator: 'Cmd+A', role: 'selectAll' }
      ]
    },
    {
      label: '윈도우',
      submenu: [
        { label: '최소화', accelerator: 'Cmd+M', role: 'minimize' },
        { label: '확대/축소', role: 'zoom' },
        { type: 'separator' },
        { label: '앞으로 가져오기', role: 'front' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
