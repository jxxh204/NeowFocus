import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '@renderer/hooks/useLocalStorage'
import { TIME } from '@renderer/constants'

// 테마 컬러 옵션
export const THEME_COLORS = {
  green: '#00FF85',
  blue: '#00D4FF',
  purple: '#B388FF',
  pink: '#FF6B9D',
  orange: '#FF9500',
  yellow: '#FFD60A'
} as const

export type ThemeColorKey = keyof typeof THEME_COLORS

// 타이머 시간 옵션 (분 단위)
export const TIMER_DURATION_OPTIONS = [15, 25, 45, 60] as const

export type Settings = {
  timerDuration: number // 초 단위
  themeColor: ThemeColorKey
}

type SettingsContextType = {
  settings: Settings
  timerDurationMinutes: number
  themeColorValue: string
  setTimerDuration: (minutes: number) => void
  setThemeColor: (color: ThemeColorKey) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: Settings = {
  timerDuration: TIME.DEFAULT_POMODORO_DURATION, // 25분 = 1500초
  themeColor: 'green'
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<Settings>('appSettings', DEFAULT_SETTINGS)

  const setTimerDuration = useCallback(
    (minutes: number) => {
      setSettings((prev) => ({
        ...prev,
        timerDuration: minutes * TIME.SECONDS_PER_MINUTE
      }))
    },
    [setSettings]
  )

  const setThemeColor = useCallback(
    (color: ThemeColorKey) => {
      setSettings((prev) => ({
        ...prev,
        themeColor: color
      }))
    },
    [setSettings]
  )

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [setSettings])

  // 분 단위 타이머 시간
  const timerDurationMinutes = Math.floor((settings?.timerDuration ?? DEFAULT_SETTINGS.timerDuration) / TIME.SECONDS_PER_MINUTE)

  // 테마 컬러 값
  const themeColorValue = THEME_COLORS[settings?.themeColor ?? DEFAULT_SETTINGS.themeColor]

  return (
    <SettingsContext.Provider
      value={{
        settings: settings ?? DEFAULT_SETTINGS,
        timerDurationMinutes,
        themeColorValue,
        setTimerDuration,
        setThemeColor,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

const useSettingsContext = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}

export { SettingsProvider, useSettingsContext }
