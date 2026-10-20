import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    message: {
      send: (action: string, args: any) => void
      receive: (channel: string, callback: any) => Electron.IpcRenderer
    }
    electron: ElectronAPI & {
      playCompletionFeedback: () => Promise<void>
      browserBlockStatus: () => Promise<import('../shared/browserBlocking').BrowserBlockStatus>
      browserBlockConfigure: (
        value: import('../shared/browserBlocking').BrowserSettings
      ) => Promise<import('../shared/browserBlocking').BrowserBlockStatus>
      browserBlockPublish: (
        value: import('../shared/browserBlocking').BrowserFocus
      ) => Promise<void>
      browserBlockOpenExtension: () => Promise<void>
      browserBlockCopyCode: () => Promise<void>
      focusCloudSubscribe: () => Promise<void>
      onFocusCloudChanged: (callback: () => void) => () => void
      focusCloudCapabilities: () => Promise<{ available: boolean; reason?: string }>
      focusCloudRead: () => Promise<{ json: string | null; changeTag: string | null }>
      focusCloudWrite: (json: string, tag: string | null) => Promise<string>
      windowMove: (deltaX: number, deltaY: number) => void
      setWindowPosition: (x: number, y: number) => void
      getWindowPosition: () => Promise<{ x: number; y: number }>
      minimizeWindow: () => void
      showNotification: (title: string, body: string) => void
      showWindow: () => void
      getSystemLocale: () => Promise<string>
    }
    api: unknown
  }
}
