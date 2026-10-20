import { app, BrowserWindow, ipcMain, pushNotifications, shell } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { parseSyncEnvelope } from '@neowfocus/core'

type CloudBridge = {
  feedback?: () => void
  available(): boolean
  request(operation: string, json?: string, tag?: string | null): Promise<string>
}
let bridge: CloudBridge | undefined
function load(): CloudBridge | undefined {
  if (process.platform !== 'darwin') return undefined
  if (bridge) return bridge
  const nativePath = app.isPackaged
    ? join(process.resourcesPath, 'focus-cloud.node')
    : join(app.getAppPath(), 'build/native/focus-cloud.node')
  if (!existsSync(nativePath)) return undefined
  try {
    bridge = require(nativePath) as CloudBridge
  } catch {
    return undefined
  }
  return bridge
}
function requireBridge(): CloudBridge {
  const native = load()
  if (!native?.available()) throw new Error('iCloud 권한이 포함된 설치 앱에서 연결해 주세요.')
  return native
}

export function registerFocusCloud(window: BrowserWindow) {
  for (const name of [
    'FOCUS_CLOUD_CAPABILITIES',
    'FOCUS_CLOUD_READ',
    'FOCUS_CLOUD_WRITE',
    'FOCUS_CLOUD_SUBSCRIBE'
  ])
    ipcMain.removeHandler(name)
  const verify = (event: Electron.IpcMainInvokeEvent) => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame)
      throw new Error('Untrusted CloudKit caller')
  }
  ipcMain.handle('FOCUS_CLOUD_CAPABILITIES', (event) => {
    verify(event)
    const available = Boolean(load()?.available())
    return {
      available,
      ...(!available ? { reason: 'iCloud 권한이 포함된 설치 앱에서 연결할 수 있어요.' } : {})
    }
  })
  const onCloudChanged = (_event: Electron.Event, info: Record<string, unknown>) => {
    if (info.ck && !window.isDestroyed()) window.webContents.send('FOCUS_CLOUD_CHANGED')
  }
  if (process.platform === 'darwin') {
    pushNotifications.on('received-apns-notification', onCloudChanged)
    window.once('closed', () =>
      pushNotifications.removeListener('received-apns-notification', onCloudChanged)
    )
  }
  ipcMain.handle('FOCUS_CLOUD_SUBSCRIBE', async (event) => {
    verify(event)
    await pushNotifications.registerForAPNSNotifications()
    await requireBridge().request('subscribe')
  })
  ipcMain.handle('FOCUS_CLOUD_READ', async (event) => {
    verify(event)
    const native = requireBridge()
    if (JSON.parse(await native.request('account')) !== 'available')
      throw new Error('시스템 설정에서 iCloud 로그인을 확인해 주세요.')
    return JSON.parse(await native.request('read'))
  })
  ipcMain.handle('FOCUS_CLOUD_WRITE', async (event, json: unknown, tag: unknown) => {
    verify(event)
    if (
      typeof json !== 'string' ||
      Buffer.byteLength(json, 'utf8') >= 900000 ||
      !parseSyncEnvelope(json) ||
      !(tag === null || (typeof tag === 'string' && tag.length < 1024))
    )
      throw new Error('Invalid focus sync payload')
    return JSON.parse(await requireBridge().request('write', json, tag as string | null))
  })
}

export function playDesktopCompletionFeedback() {
  try {
    const native = load()
    if (native?.feedback) {
      native.feedback()
      return
    }
  } catch {
    /* Sound remains available without native haptics. */
  }
  shell.beep()
}
