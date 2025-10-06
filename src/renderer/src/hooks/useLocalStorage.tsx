import { useState } from 'react'
import { LocalStorageValue } from '@renderer/types/task'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [LocalStorageValue<T>, (newValue: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<LocalStorageValue<T>>(() => {
    try {
      const storedValue = localStorage.getItem(key)
      if (storedValue !== null) {
        return JSON.parse(storedValue)
      }
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error)
      return initialValue
    }
    return initialValue
  })

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value as T) : newValue
      localStorage.setItem(key, JSON.stringify(valueToStore))
      setValue(valueToStore)
    } catch (error) {
      console.error('Error storing data in localStorage:', error)
    }
  }

  return [value, setStoredValue]
}
