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
  windowMove: (deltaX: number, deltaY: number) => {
    ipcRenderer.send('window-move', { deltaX, deltaY })
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
