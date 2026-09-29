import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { AppState } from 'react-native'
import { randomUUID } from 'expo-crypto'
import { EMPTY_STATE, focusReducer, type FocusAction, type FocusState } from '@neowfocus/core'
import {
  cancelCompletion,
  requestAlertPermission,
  scheduleCompletion,
  vibrateCompletion
} from './alerts'
import { useSettings } from './SettingsProvider'
import { storage } from './storage'

type FocusContextValue = {
  state: FocusState
  /** 화면 표시용 현재 시각. 집중 중에만 촘촘히 갱신된다. */
  now: number
  start: (task: string, minutes: number) => void
  pause: () => void
  resume: () => void
  finish: () => void
  dismiss: () => void
}

const FocusContext = createContext<FocusContextValue | null>(null)

type Action = FocusAction | { type: 'hydrate'; state: FocusState }

const reducer = (state: FocusState, action: Action): FocusState =>
  action.type === 'hydrate' ? action.state : focusReducer(state, action)

/** 시간이 끝나는 순간을 앱 안에서 직접 봤을 때만 진동한다. 백그라운드 완료는 알림이 맡는다. */
const LIVE_COMPLETION_WINDOW_MS = 3_000

export function FocusProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const [state, dispatch] = useReducer(reducer, EMPTY_STATE)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now)
  const current = state.current

  const tick = useCallback(() => {
    const t = Date.now()
    setNow(t)
    dispatch({ type: 'tick', now: t })
  }, [])

  // 저장된 상태를 불러오고, 꺼져 있던 사이에 끝난 집중은 바로 완료로 정리한다.
  useEffect(() => {
    Promise.all([storage.loadState<FocusState>(), storage.deviceId()]).then(([saved, id]) => {
      if (saved) dispatch({ type: 'hydrate', state: saved })
      setDeviceId(id)
      tick()
    })
  }, [tick])

  useEffect(() => {
    if (deviceId) storage.saveState(state)
  }, [deviceId, state])

  useEffect(() => {
    if (current?.status !== 'running') return
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [current?.status, tick])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => next === 'active' && tick())
    return () => sub.remove()
  }, [tick])

  // 완료 알림 예약: 진행 중일 때만 종료 시각에 하나를 걸어 둔다.
  useEffect(() => {
    if (!current) return
    if (current.status === 'running' && current.endsAt !== null && settings.alerts) {
      scheduleCompletion({
        id: current.id,
        task: current.task,
        endsAt: current.endsAt,
        plannedMs: current.plannedMs
      })
    } else {
      cancelCompletion(current.id)
    }
    // current 전체가 아닌 예약에 영향을 주는 값만 본다. 기록이 바뀔 때마다 다시 예약하지 않기 위해서다.
  }, [current?.id, current?.status, current?.endsAt, settings.alerts])

  const prevStatus = useRef(current?.status)
  useEffect(() => {
    const was = prevStatus.current
    prevStatus.current = current?.status
    if (was !== 'running' || current?.status !== 'finished' || !current.completed) return
    const liveCompletion = Date.now() - (current.finishedAt ?? 0) < LIVE_COMPLETION_WINDOW_MS
    if (settings.alerts && liveCompletion && AppState.currentState === 'active') vibrateCompletion()
  }, [current, settings.alerts])

  const value = useMemo<FocusContextValue | null>(() => {
    if (!deviceId) return null
    const at = () => ({ now: Date.now(), deviceId })
    return {
      state,
      now,
      start: (task, minutes) => {
        if (!task.trim()) return
        if (settings.alerts) requestAlertPermission()
        dispatch({ type: 'start', id: randomUUID(), task, plannedMs: minutes * 60_000, ...at() })
        setNow(Date.now())
      },
      pause: () => dispatch({ type: 'pause', ...at() }),
      resume: () => {
        dispatch({ type: 'resume', ...at() })
        setNow(Date.now())
      },
      finish: () => dispatch({ type: 'finish', ...at() }),
      dismiss: () => dispatch({ type: 'dismiss' })
    }
  }, [deviceId, state, now, settings.alerts])

  if (!value) return null
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export function useFocus() {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocus는 FocusProvider 안에서 써야 합니다.')
  return ctx
}
