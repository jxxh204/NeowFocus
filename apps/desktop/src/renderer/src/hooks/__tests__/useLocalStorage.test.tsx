import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))
    
    expect(result.current[0]).toBe('initialValue')
  })

  it('should return stored value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'))
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))
    
    expect(result.current[0]).toBe('storedValue')
  })

  it('should update value in localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))
    
    act(() => {
      result.current[1]('newValue')
    })
    
    expect(result.current[0]).toBe('newValue')
    expect(localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'))
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))
    
    act(() => {
      const currentValue = result.current[0] as number
      result.current[1](currentValue + 1)
    })
    
    expect(result.current[0]).toBe(1)
  })

  it('should handle objects', () => {
    const initialObject = { name: 'test', value: 123 }
    const { result } = renderHook(() => useLocalStorage('objectKey', initialObject))
    
    expect(result.current[0]).toEqual(initialObject)
    
    act(() => {
      result.current[1]({ name: 'updated', value: 456 })
    })
    
    expect(result.current[0]).toEqual({ name: 'updated', value: 456 })
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('testKey', 'invalid json')
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'))
    
    expect(result.current[0]).toBe('fallback')
  })

  it('should sync between multiple hooks using the same key', () => {
    const { result: hook1 } = renderHook(() => useLocalStorage('sharedKey', 'initial'))
    const { result: hook2 } = renderHook(() => useLocalStorage('sharedKey', 'initial'))
    
    act(() => {
      hook1.current[1]('updated')
    })
    
    // Trigger storage event manually since jsdom doesn't handle it
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'sharedKey',
        newValue: JSON.stringify('updated'),
        storageArea: localStorage
      }))
    })
    
    expect(hook2.current[0]).toBe('updated')
  })
  it('syncs same-window hooks without a synthetic storage event', () => {
    const { result: first } = renderHook(() => useLocalStorage('shared', 0))
    const { result: second } = renderHook(() => useLocalStorage('shared', 0))
    act(() => {
      first.current[1]((n) => n + 1)
      second.current[1]((n) => n + 1)
    })
    expect(first.current[0]).toBe(2)
    expect(second.current[0]).toBe(2)
  })

  it('handles another window removing data and ignores other keys', () => {
    const { result } = renderHook(() => useLocalStorage('shared', 'fallback'))
    act(() => result.current[1]('saved'))
    act(() => {
      localStorage.setItem('other', JSON.stringify('unrelated'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'other', storageArea: localStorage }))
    })
    expect(result.current[0]).toBe('saved')
    act(() => {
      localStorage.removeItem('shared')
      window.dispatchEvent(new StorageEvent('storage', { key: 'shared', storageArea: localStorage }))
    })
    expect(result.current[0]).toBe('fallback')
  })

})