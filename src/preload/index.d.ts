import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    message: {
      send: (action: string, args: any) => void
      receive: (channel: string, callback: any) => Electron.IpcRenderer
    }
    electron: ElectronAPI & {
      windowMove: (deltaX: number, deltaY: number) => void
    }
    api: unknown
  }
}
