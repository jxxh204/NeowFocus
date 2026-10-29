import '@testing-library/jest-dom'

if (typeof window !== 'undefined') {
  // Mock window.electron for tests
  ;(global.window as any).electron = {
    windowMove: jest.fn(),
    setWindowPosition: jest.fn(),
    getWindowPosition: jest.fn().mockResolvedValue({ x: 0, y: 0 }),
    ipcRenderer: {
      send: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn()
    },
    process: {
      platform: 'darwin'
    }
  }

  // Mock window.message
  ;(global.window as any).message = {
    send: jest.fn(),
    receive: jest.fn()
  }
}

// Keep jsdom's native Storage so StorageEvent.storageArea accepts it.
if (typeof Storage !== 'undefined') {
  jest.spyOn(Storage.prototype, 'getItem')
  jest.spyOn(Storage.prototype, 'setItem')
  jest.spyOn(Storage.prototype, 'removeItem')
  jest.spyOn(Storage.prototype, 'clear')
}
