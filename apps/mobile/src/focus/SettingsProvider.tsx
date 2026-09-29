import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_FOCUS_MINUTES } from '@neowfocus/core'
import { storage } from './storage'

export type Settings = {
  defaultMinutes: number
  /** 완료 알림과 진동 */
  alerts: boolean
}

const DEFAULT_SETTINGS: Settings = { defaultMinutes: DEFAULT_FOCUS_MINUTES, alerts: true }

type SettingsContextValue = {
  settings: Settings
  update: (patch: Partial<Settings>) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    storage.loadSettings<Partial<Settings>>().then((saved) => {
      if (saved) setSettings((prev) => ({ ...prev, ...saved }))
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (loaded) storage.saveSettings(settings)
  }, [loaded, settings])

  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })),
    []
  )

  if (!loaded) return null
  return (
    <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings는 SettingsProvider 안에서 써야 합니다.')
  return ctx
}
