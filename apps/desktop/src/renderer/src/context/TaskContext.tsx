import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  EMPTY_STATE,
  FocusReplicator,
  focusReducer,
  localDayKey,
  progressOf,
  remainingOf,
  serializeFocusState,
  toRecord,
  isFeedbackCompletion,
  breakAfterCompletion,
  restoreFocusBreak,
  type FocusBreak,
  type FocusAction,
  type FocusRecord,
  type FocusSession,
  type FocusState,
  type SyncStatus
} from '@neowfocus/core'
import { TIME } from '@renderer/constants'
import { useSettingsContext } from './SettingsContext'
import { DESKTOP_FOCUS_KEY, loadDesktopFocus } from './desktopFocusStorage'

export type TaskStatus = 'idle' | 'play' | 'pause' | 'end'

export type Task = {
  id: string
  date: string
  taskName: string
  /** 남은 초 */
  taskDuration: number
  /** 계획한 초. 마친 뒤에는 실제 집중한 초 */
  fullDuration: number
  taskStatus: TaskStatus
  sessionCount: number
}

export type GroupedTask = {
  taskName: string
  tasks: Task[]
  totalDuration: number
  totalCount: number
}

export type DailyTaskSummary = {
  date: string // YYYY-MM-DD
  tasks: Task[]
  totalDuration: number
  totalCount: number
}

type TaskContextType = {
  /** 진행 중인 집중을 기존 화면들이 쓰던 형태로 보여준다 */
  currentTask: Task
  taskStatus: TaskStatus
  /** 남은 초 */
  remainingTime: number
  /** 남은 비율(0~100). CircularTimer의 percentage */
  percentage: number
  taskList: Task[]
  groupedTaskList: GroupedTask[]
  dailyTaskList: DailyTaskSummary[]
  resetCurrentTask: () => void
  startTask: (taskName: string, minutes?: number) => void
  reStartTask: () => void
  pauseTask: () => void
  resumeTask: () => void
  /** 시간이 남았어도 지금까지 집중한 만큼으로 마친다 */
  completeEarly: () => void
  saveTaskToList: () => void
  deleteTasksByNameAndDate: (taskName: string, date: string) => void
  undoDeletedTasks: () => void
  deletedTaskCount: number
  focusState: FocusState
  syncEnabled: boolean
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: number | null
  setSyncEnabled: (enabled: boolean) => void
  retrySync: () => void
  resolveConflict: (sessionId: string) => void
  readyDraft: { task: string; minutes: number }
  updateDraft: (patch: Partial<{ task: string; minutes: number }>) => void
  prepareTask: (sameTask?: boolean) => void
  breakRemaining: number
  breakFinished: boolean
  finishBreak: () => void
}

const TaskContext = createContext<TaskContextType | null>(null)
const SYNC_ENABLED_KEY = 'neowfocus.sync.enabled.v1'
const BREAK_KEY = 'neowfocus.break.v1'
const LAST_SYNC_KEY = 'neowfocus.sync.lastSuccess.v1'
const LIVE_COMPLETION_WINDOW_MS = 5_000

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
function loadDeviceId(): string {
  const saved = localStorage.getItem('deviceId')
  if (saved) return saved
  const id = newId()
  localStorage.setItem('deviceId', id)
  return id
}
const STATUS: Record<FocusSession['status'], TaskStatus> = {
  running: 'play',
  paused: 'pause',
  finished: 'end'
}
function toTask(session: FocusSession | null, now: number, timerDuration: number): Task {
  if (!session)
    return {
      id: '',
      date: '',
      taskName: '',
      taskDuration: 0,
      fullDuration: timerDuration,
      taskStatus: 'idle',
      sessionCount: 1
    }
  return {
    id: session.id,
    date: new Date(session.startedAt).toISOString(),
    taskName: session.task,
    taskDuration: Math.ceil(remainingOf(session, now) / 1000),
    fullDuration: Math.round(
      (session.status === 'finished' ? session.focusedMs : session.plannedMs) / 1000
    ),
    taskStatus: STATUS[session.status],
    sessionCount: 1
  }
}
function recordToTask(record: FocusRecord, sessionCount: number): Task {
  return {
    id: record.id,
    date: new Date(record.startedAt).toISOString(),
    taskName: record.task,
    taskDuration: 0,
    fullDuration: Math.round(record.focusedMs / 1000),
    taskStatus: 'end',
    sessionCount
  }
}

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const { settings } = useSettingsContext()
  const timerDuration = settings?.timerDuration ?? TIME.DEFAULT_POMODORO_DURATION
  const [deviceId] = useState(loadDeviceId)
  const [initial] = useState(() => {
    try {
      return { state: loadDesktopFocus(deviceId, Date.now()), error: null as string | null }
    } catch (error) {
      return {
        state: EMPTY_STATE,
        error: error instanceof Error ? error.message : '기록을 불러오지 못했어요.'
      }
    }
  })
  const [focusState, setFocusState] = useState(initial.state)
  const [focusBreak, setFocusBreak] = useState<FocusBreak | null>(() => {
    let saved: unknown
    try {
      saved = JSON.parse(localStorage.getItem(BREAK_KEY) || 'null')
    } catch {
      /* Recover from the completion deadline. */
    }
    return restoreFocusBreak(initial.state.current, saved, settings.autoBreak === true)
  })
  const autoBreakEnabled = useRef(settings.autoBreak === true)
  autoBreakEnabled.current = settings.autoBreak === true
  const finishBreak = useCallback(() => {
    setFocusBreak((previous) => (previous ? { ...previous, endsAt: null } : null))
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(BREAK_KEY, JSON.stringify(focusBreak))
    } catch {
      /* Keep the in-memory break. */
    }
  }, [focusBreak])
  useEffect(() => {
    if (settings.autoBreak !== true) finishBreak()
  }, [settings.autoBreak, finishBreak])
  const stateRef = useRef(focusState)
  const [now, setNow] = useState(Date.now)
  const session = focusState.current
  const breakMatches = session?.status === 'finished' && session.id === focusBreak?.sessionId
  const breakRemaining =
    breakMatches && settings.autoBreak === true && focusBreak?.endsAt
      ? Math.max(0, Math.ceil((focusBreak.endsAt - now) / 1000))
      : 0
  const onBreak = breakRemaining > 0
  const breakFinished = Boolean(breakMatches && focusBreak?.endsAt && !onBreak)
  const lastFinished = useRef<FocusSession | null>(null)
  if (session?.status === 'finished') lastFinished.current = session
  const [readyDraft, setReadyDraft] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('neowfocus.ready.v1') || 'null')
      if (
        saved &&
        typeof saved.task === 'string' &&
        saved.task.length <= 54 &&
        Number.isFinite(saved.minutes) &&
        saved.minutes > 0 &&
        saved.minutes <= 180
      )
        return saved as { task: string; minutes: number }
    } catch {
      /* A damaged draft never replaces focus records. */
    }
    return { task: '', minutes: timerDuration / 60 }
  })
  const updateDraft = useCallback((patch: Partial<{ task: string; minutes: number }>) => {
    setReadyDraft((previous) => ({ ...previous, ...patch }))
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('neowfocus.ready.v1', JSON.stringify(readyDraft))
    } catch {
      /* Keep the draft in memory. */
    }
  }, [readyDraft])
  const [syncEnabled, setEnabled] = useState(
    () => localStorage.getItem(SYNC_ENABLED_KEY) === 'true'
  )
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off')
  const [syncAttempt, setSyncAttempt] = useState(0)
  const [syncError, setSyncError] = useState<string | null>(initial.error)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() => {
    const saved = Number(localStorage.getItem(LAST_SYNC_KEY))
    return saved > 0 ? saved : null
  })
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const foregroundSince = useRef(Date.now())
  const alertsEnabled = useRef(settings.alerts !== false)
  alertsEnabled.current = settings.alerts !== false
  const replica = useRef<FocusReplicator | null>(null)
  const applyState = useCallback((next: FocusState) => {
    const previous = stateRef.current.current
    const current = next.current
    if (current?.status !== 'finished') setFocusBreak(null)
    else if (previous?.id === current.id && previous.status !== 'finished')
      setFocusBreak(breakAfterCompletion(current, autoBreakEnabled.current))
    if (
      alertsEnabled.current &&
      isFeedbackCompletion(
        stateRef.current.current,
        next.current,
        deviceId,
        Date.now(),
        foregroundSince.current
      )
    ) {
      void window.electron?.playCompletionFeedback?.().catch(() => {})
    }
    stateRef.current = next
    setFocusState(next)
  }, [])
  const send = useCallback(
    (action: FocusAction) => {
      const next = focusReducer(stateRef.current, action)
      if (next !== stateRef.current) applyState(next)
      setNow(Date.now())
    },
    [applyState]
  )
  const stamp = useCallback(() => ({ now: Date.now(), deviceId }), [deviceId])

  const taskList = useMemo(() => {
    const counts = new Map<string, number>()
    return [...focusState.records]
      .sort((a, b) => a.startedAt - b.startedAt)
      .map((record) => {
        const key = JSON.stringify([localDayKey(record.startedAt), record.task])
        const count = (counts.get(key) ?? 0) + 1
        counts.set(key, count)
        return recordToTask(record, count)
      })
  }, [focusState.records])

  useEffect(() => {
    if (initial.error) return
    try {
      localStorage.setItem(DESKTOP_FOCUS_KEY, serializeFocusState(focusState))
      // Compatibility snapshots; the untouched original data is retained by the migration backup.
      localStorage.setItem('focusSession', JSON.stringify(session))
      localStorage.setItem('taskList', JSON.stringify(taskList))
    } catch {
      setSyncError('이 기기에 기록을 저장하지 못했어요. 저장 공간을 확인해주세요.')
    }
    void replica.current?.sync()
  }, [focusState, session, taskList, initial.error])

  const tick = useCallback(() => send({ type: 'tick', now: Date.now() }), [send])
  useEffect(() => {
    const publish = () => {
      const current = stateRef.current.current
      void window.electron
        ?.browserBlockPublish?.({
          status: current?.status ?? 'idle',
          endsAt: current?.endsAt ?? null
        })
        .catch(() => {})
    }
    publish()
    const heartbeat = setInterval(publish, 2000)
    return () => clearInterval(heartbeat)
  }, [session])
  useEffect(() => {
    tick()
    const focused = () => {
      foregroundSince.current = Date.now()
      tick()
    }
    window.addEventListener('focus', focused)
    const interval = setInterval(
      tick,
      session?.status === 'running' || onBreak ? TIME.TIMER_INTERVAL : 30_000
    )
    return () => {
      if (interval) clearInterval(interval)
      window.removeEventListener('focus', focused)
    }
  }, [session?.status, onBreak, tick])

  useEffect(() => {
    if (!syncEnabled || initial.error) {
      setSyncStatus('off')
      return
    }
    let active = true
    let unsubscribe: (() => void) | undefined
    const sync = () => {
      void replica.current?.sync()
    }
    setSyncStatus('connecting')
    const connect = async () => {
      try {
        const bridge = window.electron
        if (!bridge?.focusCloudCapabilities || !bridge.focusCloudRead || !bridge.focusCloudWrite)
          throw new Error('이 버전에서는 iCloud 연결을 사용할 수 없어요.')
        const caps = await bridge.focusCloudCapabilities()
        if (!active) return
        if (!caps.available)
          throw new Error(caps.reason || '이 기기에서 iCloud 연결을 사용할 수 없어요.')
        const client = new FocusReplicator({
          transport: {
            read: () => bridge.focusCloudRead(),
            write: (json, tag) => bridge.focusCloudWrite(json, tag)
          },
          getState: () => stateRef.current,
          applyState,
          onStatus: (status, message) => {
            if (!active) return
            setSyncStatus(status)
            setSyncError(message ?? null)
            if (status === 'synced' || status === 'conflict') {
              const at = Date.now()
              setLastSyncedAt(at)
              localStorage.setItem(LAST_SYNC_KEY, String(at))
            }
          }
        })
        replica.current = client
        sync()
        unsubscribe = bridge.onFocusCloudChanged?.(sync)
        if (bridge.focusCloudSubscribe)
          void bridge.focusCloudSubscribe().catch(() => {
            if (active) setSyncError('변경 알림을 연결하지 못했어요. 앱으로 돌아오면 동기화해요.')
          })
        window.addEventListener('focus', sync)
      } catch (error) {
        if (!active) return
        setSyncStatus('offline')
        setSyncError(error instanceof Error ? error.message : String(error))
      }
    }
    void connect()
    return () => {
      active = false
      replica.current?.stop()
      replica.current = null
      unsubscribe?.()
      window.removeEventListener('focus', sync)
    }
  }, [syncEnabled, syncAttempt, applyState, initial.error])

  const setSyncEnabled = useCallback(
    (enabled: boolean) => {
      if (!enabled) replica.current?.stop()
      localStorage.setItem(SYNC_ENABLED_KEY, String(enabled))
      setEnabled(enabled)
      if (!enabled) {
        setSyncStatus('off')
        setSyncError(initial.error)
      }
    },
    [initial.error]
  )
  const retrySync = useCallback(() => {
    if (replica.current) void replica.current.sync()
    else if (syncEnabled) setSyncAttempt((attempt) => attempt + 1)
  }, [syncEnabled])

  const prevStatus = useRef(session?.status)
  useEffect(() => {
    const was = prevStatus.current
    prevStatus.current = session?.status
    if (
      !alertsEnabled.current ||
      was !== 'running' ||
      session?.status !== 'finished' ||
      !session.completed
    )
      return
    if ((session.startedBy ?? session.updatedBy) !== deviceId) return
    if (Date.now() - (session.finishedAt ?? 0) > LIVE_COMPLETION_WINDOW_MS) return
    window.electron?.showNotification?.(t('focus.notification.title'), t('focus.notification.body'))
    window.electron?.showWindow?.()
  }, [session, t, deviceId])

  const resetCurrentTask = useCallback(() => {
    const current = stateRef.current.current
    if (current && current.status !== 'finished') {
      send({ type: 'finish', ...stamp() })
      send({ type: 'deleteRecord', id: current.id, ...stamp() })
    }
    send({ type: 'dismiss' })
  }, [send, stamp])
  const startTask = useCallback(
    (taskName: string, minutes?: number) => {
      if (!taskName.trim() || initial.error) return
      const seconds = minutes === undefined ? timerDuration : minutes * 60
      if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 180 * 60) return
      send({ type: 'start', id: newId(), task: taskName, plannedMs: seconds * 1000, ...stamp() })
    },
    [send, stamp, timerDuration, initial.error]
  )
  const prepareTask = useCallback(
    (sameTask = true) => {
      const current = stateRef.current.current
      if (current && current.status !== 'finished') return
      const previous = current ?? lastFinished.current
      setReadyDraft({
        task: sameTask ? (previous?.task ?? '') : '',
        minutes: previous ? previous.plannedMs / 60_000 : timerDuration / 60
      })
      send({ type: 'dismiss' })
    },
    [send, timerDuration]
  )
  const reStartTask = useCallback(() => prepareTask(true), [prepareTask])
  const pauseTask = useCallback(() => send({ type: 'pause', ...stamp() }), [send, stamp])
  const resumeTask = useCallback(() => send({ type: 'resume', ...stamp() }), [send, stamp])
  const completeEarly = useCallback(() => send({ type: 'finish', ...stamp() }), [send, stamp])
  const currentTask = useMemo(
    () => toTask(session, now, timerDuration),
    [session, now, timerDuration]
  )
  const percentage = session ? (1 - progressOf(session, now)) * 100 : 0

  // taskList를 taskName별로 그룹화
  const groupedTaskList = useMemo((): GroupedTask[] => {
    const grouped = taskList.reduce(
      (acc, task) => {
        if (!acc[task.taskName]) {
          acc[task.taskName] = {
            taskName: task.taskName,
            tasks: [],
            totalDuration: 0,
            totalCount: 0
          }
        }
        acc[task.taskName].tasks.push(task)
        acc[task.taskName].totalDuration += task.fullDuration
        acc[task.taskName].totalCount += 1
        return acc
      },
      {} as Record<string, GroupedTask>
    )
    return Object.values(grouped)
  }, [taskList])

  // taskList를 날짜별로 그룹화 (최신순) - dayjs로 로컬 시간대 적용
  const dailyTaskList = useMemo((): DailyTaskSummary[] => {
    const grouped = taskList.reduce(
      (acc, task) => {
        const dateKey = task.date ? dayjs(task.date).format('YYYY-MM-DD') : 'unknown'
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            tasks: [],
            totalDuration: 0,
            totalCount: 0
          }
        }
        acc[dateKey].tasks.push(task)
        acc[dateKey].totalDuration += task.fullDuration
        acc[dateKey].totalCount += 1
        return acc
      },
      {} as Record<string, DailyTaskSummary>
    )
    return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))
  }, [taskList])

  // Normal completion is saved by the core. Preserve the legacy explicit save API, without duplicates.
  const saveTaskToList = useCallback(() => {
    const state = stateRef.current
    const current = state.current
    if (
      !current ||
      current.status !== 'finished' ||
      state.records.some((record) => record.id === current.id)
    )
      return
    const record = toRecord(current, true)
    if (record)
      send({ ...state, type: 'sync', records: [...state.records, record], now: Date.now() })
  }, [send])
  const deleteTasksByNameAndDate = useCallback(
    (taskName: string, date: string) => {
      const ids = stateRef.current.records
        .filter((record) => record.task === taskName && localDayKey(record.startedAt) === date)
        .map((record) => record.id)
      ids.forEach((id) => send({ type: 'deleteRecord', id, ...stamp() }))
      setDeletedIds((previous) => [...new Set([...previous, ...ids])])
    },
    [send, stamp]
  )
  const undoDeletedTasks = useCallback(() => {
    deletedIds.forEach((id) => send({ type: 'undoDeleteRecord', id, ...stamp() }))
    setDeletedIds([])
  }, [deletedIds, send, stamp])
  const resolveConflict = useCallback(
    (sessionId: string) => send({ type: 'resolveConflict', sessionId, ...stamp() }),
    [send, stamp]
  )

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        taskStatus: currentTask.taskStatus,
        remainingTime: currentTask.taskDuration,
        percentage,
        taskList,
        groupedTaskList,
        dailyTaskList,
        resetCurrentTask,
        startTask,
        reStartTask,
        pauseTask,
        resumeTask,
        completeEarly,
        saveTaskToList,
        deleteTasksByNameAndDate,
        undoDeletedTasks,
        deletedTaskCount: deletedIds.length,
        focusState,
        syncEnabled,
        syncStatus,
        syncError,
        lastSyncedAt,
        setSyncEnabled,
        retrySync,
        resolveConflict,
        readyDraft,
        updateDraft,
        prepareTask,
        breakRemaining,
        breakFinished,
        finishBreak
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTaskContext must be used within a TaskProvider')
  return context
}
export { TaskProvider, useTaskContext }
