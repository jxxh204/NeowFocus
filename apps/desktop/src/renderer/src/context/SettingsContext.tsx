import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '@renderer/hooks/useLocalStorage'
import { TIME } from '@renderer/constants'

// 테마 컬러 옵션
export const THEME_COLORS = {
  white: '#FFFFFF',
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

// 슈퍼포커스 작업실. default는 처음 그린 작업실로, 회색 고양이가 그림에 함께 그려져 있다
export type SuperFocusRoom = 'default' | 'nature' | 'scrapyard'
export type SuperFocusCat = 'gray' | 'british' | 'siamese' | 'maine'

const SUPER_FOCUS_ROOMS: readonly string[] = ['default', 'nature', 'scrapyard']
const SUPER_FOCUS_CATS: readonly string[] = ['gray', 'british', 'siamese', 'maine']

export type Settings = {
  timerDuration: number // 초 단위
  themeColor: ThemeColorKey
  autoBreak?: boolean
  alerts?: boolean
  superFocusRoom?: SuperFocusRoom
  superFocusCat?: SuperFocusCat
}

/** 저장된 값이 없거나 지금은 없는 작업실이면 기본값으로 읽는다 */
export function superFocusScene(settings: Settings): { room: SuperFocusRoom; cat: SuperFocusCat } {
  const room = SUPER_FOCUS_ROOMS.includes(settings.superFocusRoom ?? '')
    ? (settings.superFocusRoom as SuperFocusRoom)
    : 'default'
  const cat = SUPER_FOCUS_CATS.includes(settings.superFocusCat ?? '')
    ? (settings.superFocusCat as SuperFocusCat)
    : 'gray'
  // 기본 작업실에는 회색 고양이가 그려져 있어서 다른 고양이를 얹지 않는다
  return { room, cat: room === 'default' ? 'gray' : cat }
}

type SettingsContextType = {
  settings: Settings
  timerDurationMinutes: number
  themeColorValue: string
  setTimerDuration: (minutes: number) => void
  setThemeColor: (color: ThemeColorKey) => void
  resetSettings: () => void
  updateExperience: (
    patch: Pick<Partial<Settings>, 'alerts' | 'autoBreak' | 'superFocusRoom' | 'superFocusCat'>
  ) => void
}

const DEFAULT_SETTINGS: Settings = {
  timerDuration: TIME.DEFAULT_POMODORO_DURATION, // 25분 = 1500초
  themeColor: 'white',
  autoBreak: false
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
  const updateExperience = useCallback(
    (
      patch: Pick<Partial<Settings>, 'alerts' | 'autoBreak' | 'superFocusRoom' | 'superFocusCat'>
    ) => {
      setSettings((prev) => ({ ...prev, ...patch }))
    },
    [setSettings]
  )

  // 분 단위 타이머 시간
  const timerDurationMinutes = Math.floor(
    (settings?.timerDuration ?? DEFAULT_SETTINGS.timerDuration) / TIME.SECONDS_PER_MINUTE
  )

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
        resetSettings,
        updateExperience
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
