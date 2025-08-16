import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    message: {
      send: (action: string, args: any) => void
      receive: (channel: string, callback: any) => Electron.IpcRenderer
    }
    electron: ElectronAPI & {
      windowMove: (deltaX: number, deltaY: number) => void
      setWindowPosition: (x: number, y: number) => void
      getWindowPosition: () => Promise<{ x: number; y: number }>
    }
    api: unknown
  }
}
