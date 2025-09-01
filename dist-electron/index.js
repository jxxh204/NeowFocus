"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {};
const message = {
  send: function(action, args) {
    electron.ipcRenderer.send(action, args);
  },
  receive: (channel, callback) => electron.ipcRenderer.on(channel, (_event, value) => callback(value))
};
const windowAPI = {
  windowMove: (deltaX, deltaY) => {
    electron.ipcRenderer.send("window-move", { deltaX, deltaY });
  },
  setWindowPosition: (x, y) => {
    electron.ipcRenderer.send("window-set-position", { x, y });
  },
  getWindowPosition: () => {
    return electron.ipcRenderer.invoke("window-get-position");
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", { ...preload.electronAPI, ...windowAPI });
    electron.contextBridge.exposeInMainWorld("api", api);
    electron.contextBridge.exposeInMainWorld("message", message);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = { ...preload.electronAPI, ...windowAPI };
  window.api = api;
}
//# sourceMappingURL=index.js.map
