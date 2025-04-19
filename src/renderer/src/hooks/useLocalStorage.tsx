import { useState } from 'react'
import { LocalStorageValue } from '@renderer/types/task'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [LocalStorageValue<T>, (newValue: T) => void] {
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

  // useEffect(() => {
  //   try {
  //     const storedValue = localStorage.getItem(key)
  //     if (storedValue !== null) {
  //       setValue(JSON.parse(storedValue))
  //     }
  //   } catch (error) {
  //     console.error('로컬스토리지에 없는 Key입니다.:', error)
  //   }
  // }, [key])

  const setStoredValue = (newValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue))
      setValue(newValue)
    } catch (error) {
      console.error('Error storing data in localStorage:', error)
    }
  }

  return [value, setStoredValue]
}
