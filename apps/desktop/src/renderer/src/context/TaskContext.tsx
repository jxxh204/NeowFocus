import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  finishFocus,
  pauseFocus,
  progressOf,
  remainingOf,
  resumeFocus,
  settleFocus,
  startFocus,
  type FocusSession
} from '@neowfocus/core'
import { useLocalStorage } from '@renderer/hooks/useLocalStorage'
import { TIME } from '@renderer/constants'
import { useSettingsContext } from './SettingsContext'
import { sessionFromLegacyTask, type LegacyTask } from './legacySession'

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
  startTask: (taskName: string) => void
  reStartTask: () => void
  pauseTask: () => void
  resumeTask: () => void
  /** 시간이 남았어도 지금까지 집중한 만큼으로 마친다 */
  completeEarly: () => void
  saveTaskToList: () => void
  deleteTasksByNameAndDate: (taskName: string, date: string) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

// 진행 중인 집중은 공통 코어(@neowfocus/core)의 세션으로 저장한다.
// 남은 초가 아니라 종료 시각을 저장하므로 창이 숨겨져 타이머가 느려져도 어긋나지 않는다.
const SESSION_KEY = 'focusSession'
const LEGACY_TASK_KEY = 'currentTask'
const DEVICE_ID_KEY = 'deviceId'

/** 이 시간 안에 끝난 것을 봤을 때만 완료 알림을 띄운다. 오래전에 끝난 집중을 다시 열 때는 띄우지 않는다. */
const LIVE_COMPLETION_WINDOW_MS = 5_000

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

function loadDeviceId(): string {
  const saved = localStorage.getItem(DEVICE_ID_KEY)
  if (saved) return saved
  const id = newId()
  localStorage.setItem(DEVICE_ID_KEY, id)
  return id
}

function loadSession(deviceId: string): FocusSession | null {
  if (localStorage.getItem(SESSION_KEY) !== null) return readJson<FocusSession>(SESSION_KEY)
  const migrated = sessionFromLegacyTask(
    readJson<LegacyTask>(LEGACY_TASK_KEY),
    Date.now(),
    deviceId
  )
  localStorage.setItem(SESSION_KEY, JSON.stringify(migrated))
  localStorage.removeItem(LEGACY_TASK_KEY)
  return migrated
}

const STATUS: Record<FocusSession['status'], TaskStatus> = {
  running: 'play',
  paused: 'pause',
  finished: 'end'
}

function toTask(session: FocusSession | null, now: number, timerDuration: number): Task {
  if (!session) {
    return {
      id: '',
      date: '',
      taskName: '',
      taskDuration: 0,
      fullDuration: timerDuration,
      taskStatus: 'idle',
      sessionCount: 1
    }
  }
  const finished = session.status === 'finished'
  return {
    id: session.id,
    date: new Date(session.startedAt).toISOString(),
    taskName: session.task,
    taskDuration: Math.ceil(remainingOf(session, now) / 1000),
    fullDuration: Math.round((finished ? session.focusedMs : session.plannedMs) / 1000),
    taskStatus: STATUS[session.status],
    sessionCount: 1
  }
}

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const { settings } = useSettingsContext()
  const timerDuration = settings?.timerDuration ?? TIME.DEFAULT_POMODORO_DURATION

  const [deviceId] = useState(loadDeviceId)
  const [session, setSession] = useState(() => loadSession(deviceId))
  const [now, setNow] = useState(Date.now)
  const [taskList, setTaskList] = useLocalStorage<Task[]>('taskList', [])

  const update = useCallback(
    (next: (s: FocusSession | null, now: number) => FocusSession | null) => {
      const at = Date.now()
      setNow(at)
      setSession((prev) => next(prev, at))
    },
    []
  )

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [session])

  // 진행 중일 때만 화면을 갱신한다. 남은 시간은 매번 종료 시각에서 다시 계산한다.
  const tick = useCallback(() => update((s, at) => (s ? settleFocus(s, at) : s)), [update])
  useEffect(() => {
    tick()
    if (session?.status !== 'running') return
    const interval = setInterval(tick, TIME.TIMER_INTERVAL)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', tick)
    }
  }, [session?.status, tick])

  // 시간이 다 된 순간: 알림을 띄우고 창을 앞으로 가져온다(기존 useTimer 동작).
  const prevStatus = useRef(session?.status)
  useEffect(() => {
    const was = prevStatus.current
    prevStatus.current = session?.status
    if (was !== 'running' || session?.status !== 'finished' || !session.completed) return
    if (Date.now() - (session.finishedAt ?? 0) > LIVE_COMPLETION_WINDOW_MS) return
    window.electron?.showNotification?.(t('focus.notification.title'), t('focus.notification.body'))
    window.electron?.showWindow?.()
  }, [session, t])

  const resetCurrentTask = useCallback(() => update(() => null), [update])

  const startTask = useCallback(
    (taskName: string) => {
      if (!taskName.trim()) return
      update((_, at) =>
        startFocus({
          id: newId(),
          task: taskName,
          plannedMs: timerDuration * 1000,
          now: at,
          deviceId
        })
      )
    },
    [update, timerDuration, deviceId]
  )

  const reStartTask = useCallback(() => {
    if (session) startTask(session.task)
  }, [session, startTask])

  const pauseTask = useCallback(
    () => update((s, at) => (s ? pauseFocus(s, at, deviceId) : s)),
    [update, deviceId]
  )
  const resumeTask = useCallback(
    () => update((s, at) => (s ? resumeFocus(s, at, deviceId) : s)),
    [update, deviceId]
  )
  const completeEarly = useCallback(
    () => update((s, at) => (s ? finishFocus(s, at, deviceId) : s)),
    [update, deviceId]
  )

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

  const saveTaskToList = useCallback(() => {
    // 완료된 task만 저장
    if (currentTask.taskStatus === 'end' && currentTask.taskName) {
      const today = dayjs().format('YYYY-MM-DD')

      // 같은 날짜, 같은 이름의 task 개수 계산 (당일 반복 횟수)
      const sameTasks = taskList.filter((task) => {
        const taskDate = task.date ? dayjs(task.date).format('YYYY-MM-DD') : ''
        return task.taskName === currentTask.taskName && taskDate === today
      })

      setTaskList((prevList) => [
        ...prevList,
        { ...currentTask, sessionCount: sameTasks.length + 1 }
      ])
    }
  }, [currentTask, taskList, setTaskList])

  // 특정 날짜의 특정 이름을 가진 모든 태스크 삭제
  const deleteTasksByNameAndDate = useCallback(
    (taskName: string, date: string) => {
      setTaskList((prevList) =>
        prevList.filter((task) => {
          const taskDate = task.date ? dayjs(task.date).format('YYYY-MM-DD') : ''
          return !(task.taskName === taskName && taskDate === date)
        })
      )
    },
    [setTaskList]
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
        deleteTasksByNameAndDate
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}

export { TaskProvider, useTaskContext }
