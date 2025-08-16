import { 
  getStorageItem, 
  setStorageItem, 
  removeStorageItem, 
  clearStorage 
} from '../storageUtils'

describe('storageUtils', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('getStorageItem', () => {
    it('should return default value when key does not exist', () => {
      const result = getStorageItem('nonexistent', 'default')
      expect(result).toBe('default')
    })

    it('should return parsed value when key exists', () => {
      localStorage.setItem('testKey', JSON.stringify({ value: 'test' }))
      const result = getStorageItem('testKey', null)
      expect(result).toEqual({ value: 'test' })
    })

    it('should handle string values', () => {
      localStorage.setItem('stringKey', JSON.stringify('stringValue'))
      const result = getStorageItem('stringKey', '')
      expect(result).toBe('stringValue')
    })

    it('should handle number values', () => {
      localStorage.setItem('numberKey', JSON.stringify(42))
      const result = getStorageItem('numberKey', 0)
      expect(result).toBe(42)
    })

    it('should handle array values', () => {
      const array = [1, 2, 3]
      localStorage.setItem('arrayKey', JSON.stringify(array))
      const result = getStorageItem('arrayKey', [])
      expect(result).toEqual(array)
    })

    it('should return default value on parse error', () => {
      localStorage.setItem('invalidKey', 'invalid json')
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const result = getStorageItem('invalidKey', 'fallback')
      
      expect(result).toBe('fallback')
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('setStorageItem', () => {
    it('should store string values', () => {
      setStorageItem('key', 'value')
      expect(localStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify('value'))
    })

    it('should store object values', () => {
      const obj = { name: 'test', age: 25 }
      setStorageItem('objKey', obj)
      expect(localStorage.setItem).toHaveBeenCalledWith('objKey', JSON.stringify(obj))
    })

    it('should store array values', () => {
      const arr = [1, 2, 3]
      setStorageItem('arrKey', arr)
      expect(localStorage.setItem).toHaveBeenCalledWith('arrKey', JSON.stringify(arr))
    })

    it('should handle storage errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage full')
      })
      
      setStorageItem('key', 'value')
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('removeStorageItem', () => {
    it('should remove item from storage', () => {
      removeStorageItem('testKey')
      expect(localStorage.removeItem).toHaveBeenCalledWith('testKey')
    })

    it('should handle removal errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      localStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Remove failed')
      })
      
      removeStorageItem('key')
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('clearStorage', () => {
    it('should clear all storage', () => {
      clearStorage()
      expect(localStorage.clear).toHaveBeenCalled()
    })

    it('should handle clear errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      localStorage.clear = jest.fn().mockImplementation(() => {
        throw new Error('Clear failed')
      })
      
      clearStorage()
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('server-side rendering', () => {
    const originalWindow = global.window

    beforeEach(() => {
      // Reset localStorage mock after previous tests
      jest.clearAllMocks()
      // @ts-ignore
      delete global.window
    })

    afterEach(() => {
      global.window = originalWindow
      // Restore localStorage mock
      Object.defineProperty(window, 'localStorage', {
        value: (global as any).localStorage,
        writable: true
      })
    })

    it('should return default value when window is undefined', () => {
      const result = getStorageItem('key', 'default')
      expect(result).toBe('default')
    })

    it('should not throw when setting item without window', () => {
      expect(() => setStorageItem('key', 'value')).not.toThrow()
    })

    it('should not throw when removing item without window', () => {
      expect(() => removeStorageItem('key')).not.toThrow()
    })

    it('should not throw when clearing storage without window', () => {
      expect(() => clearStorage()).not.toThrow()
    })
  })
})