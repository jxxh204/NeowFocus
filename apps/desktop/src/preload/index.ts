import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}
const message = {
  send: function (action, args) {
    ipcRenderer.send(action, args)
  },
  receive: (channel, callback) => ipcRenderer.on(channel, (_event, value) => callback(value))
}

const windowAPI = {
  playCompletionFeedback: () => ipcRenderer.invoke('FOCUS_COMPLETION_FEEDBACK'),
  browserBlockStatus: () => ipcRenderer.invoke('FOCUS_BROWSER_STATUS'),
  browserBlockConfigure: (value: { enabled: boolean; domains: string[] }) =>
    ipcRenderer.invoke('FOCUS_BROWSER_SETTINGS', value),
  browserBlockPublish: (value: { status: string; endsAt: number | null }) =>
    ipcRenderer.invoke('FOCUS_BROWSER_PUBLISH', value),
  browserBlockOpenExtension: () => ipcRenderer.invoke('FOCUS_BROWSER_OPEN_EXTENSION'),
  browserBlockCopyCode: () => ipcRenderer.invoke('FOCUS_BROWSER_COPY_CODE'),
  focusCloudSubscribe: () => ipcRenderer.invoke('FOCUS_CLOUD_SUBSCRIBE'),
  onFocusCloudChanged: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('FOCUS_CLOUD_CHANGED', listener)
    return () => {
      ipcRenderer.removeListener('FOCUS_CLOUD_CHANGED', listener)
    }
  },
  focusCloudCapabilities: () => ipcRenderer.invoke('FOCUS_CLOUD_CAPABILITIES'),
  focusCloudRead: () => ipcRenderer.invoke('FOCUS_CLOUD_READ'),
  focusCloudWrite: (json: string, tag: string | null) =>
    ipcRenderer.invoke('FOCUS_CLOUD_WRITE', json, tag),
  windowMove: (deltaX: number, deltaY: number) => {
    ipcRenderer.send('window-move', { deltaX, deltaY })
  },
  setWindowPosition: (x: number, y: number) => {
    ipcRenderer.send('window-set-position', { x, y })
  },
  getWindowPosition: () => {
    return ipcRenderer.invoke('window-get-position')
  },
  minimizeWindow: () => {
    ipcRenderer.send('window-minimize')
  },
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('SHOW_NOTIFICATION', { title, body })
  },
  showWindow: () => {
    ipcRenderer.send('SHOW_WINDOW')
  },
  getSystemLocale: (): Promise<string> => {
    return ipcRenderer.invoke('GET_SYSTEM_LOCALE')
  },
  onSuperFocusExited: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('SUPER_FOCUS_EXITED', listener)
    return () => {
      ipcRenderer.removeListener('SUPER_FOCUS_EXITED', listener)
    }
  },
  onNavigateTo: (callback: (route: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, route: string) => callback(route)
    ipcRenderer.on('NAVIGATE_TO', handler)
    // cleanup 함수 반환
    return () => {
      ipcRenderer.removeListener('NAVIGATE_TO', handler)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', { ...electronAPI, ...windowAPI })
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('message', message)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = { ...electronAPI, ...windowAPI }
  // @ts-ignore (define in dts)
  window.api = api
}
