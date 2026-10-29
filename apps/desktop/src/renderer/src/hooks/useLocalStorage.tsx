import { useEffect, useRef, useState } from 'react'
import { LocalStorageValue } from '@renderer/types/task'

const LOCAL_STORAGE_EVENT = 'neowfocus:local-storage'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [LocalStorageValue<T>, (newValue: T | ((prev: T) => T)) => void] {
  const fallback = useRef(initialValue)
  fallback.current = initialValue

  const readValue = (): T => {
    try {
      const storedValue = localStorage.getItem(key)
      return storedValue === null ? fallback.current : JSON.parse(storedValue)
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error)
      return fallback.current
    }
  }
  const [value, setValue] = useState<LocalStorageValue<T>>(readValue)

  useEffect(() => {
    const sync = () => setValue(readValue())
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea && event.storageArea !== localStorage) return
      if (event.key === null || event.key === key) sync()
    }
    const onLocalStorage = (event: Event) => {
      if ((event as CustomEvent<string>).detail === key) sync()
    }
    sync()
    window.addEventListener('storage', onStorage)
    window.addEventListener(LOCAL_STORAGE_EVENT, onLocalStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(LOCAL_STORAGE_EVENT, onLocalStorage)
    }
  }, [key])

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(readValue()) : newValue
      localStorage.setItem(key, JSON.stringify(valueToStore))
      setValue(valueToStore)
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: key }))
    } catch (error) {
      console.error('Error storing data in localStorage:', error)
    }
  }

  return [value, setStoredValue]
}
