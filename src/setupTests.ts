import '@testing-library/jest-dom'

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

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})