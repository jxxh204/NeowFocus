import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_FOCUS_MINUTES } from '@neowfocus/core'
import { storage } from './storage'
import { normalizeTimerAppearance, type TimerStyle } from './timerStyle'

export type Settings = {
  defaultMinutes: number
  timerStyle: TimerStyle
  showRemainingTime: boolean
  /** 완료 알림과 진동 */
  autoBreak: boolean
  alerts: boolean
  syncEnabled: boolean
  showTaskOnLockScreen: boolean
  restDay?: string
  lastDayEndEntry?: string
}

const DEFAULT_SETTINGS: Settings = { ...normalizeTimerAppearance(null), defaultMinutes: DEFAULT_FOCUS_MINUTES, alerts: true, autoBreak: false, syncEnabled: false, showTaskOnLockScreen: false }

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
      if (saved) setSettings((prev) => ({ ...prev, ...saved,
        alerts: typeof saved.alerts === 'boolean' ? saved.alerts : prev.alerts,
        autoBreak: saved.autoBreak === true, ...normalizeTimerAppearance(saved) }))
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (loaded) void storage.saveSettings(settings).catch(() => {})
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
