import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    message: {
      send: (action: string, args: any) => void
    }
    electron: ElectronAPI
    api: unknown
  }
}
