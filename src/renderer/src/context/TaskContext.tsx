import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '@renderer/hooks/useLocalStorage'
import { TIME } from '@renderer/constants'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useSettingsContext } from './SettingsContext'

export type TaskStatus = 'idle' | 'play' | 'pause' | 'end'

export type Task = {
  id: string
  date: string
  taskName: string
  taskDuration: number
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
  currentTask: Task
  taskStatus: TaskStatus
  taskList: Task[]
  groupedTaskList: GroupedTask[]
  dailyTaskList: DailyTaskSummary[]
  resetCurrentTask: () => void
  updateTask: (duration: number, status?: TaskStatus) => void
  pastComplete: (elapsedTime: number) => void
  startTask: (taskName: string) => void
  reStartTask: () => void
  incrementSession: () => void
  saveTaskToList: () => void
  deleteTasksByNameAndDate: (taskName: string, date: string) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettingsContext()
  const timerDuration = settings?.timerDuration ?? TIME.DEFAULT_POMODORO_DURATION

  const [currentTask, setCurrentTask] = useLocalStorage<Task>('currentTask', {
    id: uuidv4(), // 고유 식별자
    date: '', // 태스크가 생성된 날짜 (ISO 문자열 형식)
    taskName: '', // 태스크 이름
    taskDuration: timerDuration, // 현재까지 진행된 시간
    fullDuration: timerDuration, // 태스크 총 시간
    taskStatus: 'idle', // 태스크 상태
    sessionCount: 1 // 세션 카운트
  })

  const [taskList, setTaskList] = useLocalStorage<Task[]>('taskList', [])

  const resetCurrentTask = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('resetCurrentTask')
    }
    setCurrentTask({
      id: uuidv4(),
      date: '',
      taskName: '',
      taskDuration: 0,
      fullDuration: timerDuration,
      taskStatus: 'idle',
      sessionCount: 1
    })
  }

  const reStartTask = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('reStartTask')
    }
    setCurrentTask({
      id: uuidv4(),
      date: new Date().toISOString(),
      taskName: currentTask?.taskName ?? '',
      taskDuration: timerDuration,
      fullDuration: timerDuration,
      taskStatus: 'play',
      sessionCount: currentTask?.sessionCount ?? 1
    })
  }

  const startTask = (taskName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('startTask', taskName)
    }
    setCurrentTask({
      id: uuidv4(),
      date: new Date().toISOString(),
      taskName: taskName,
      taskDuration: timerDuration,
      fullDuration: timerDuration,
      taskStatus: 'play',
      sessionCount: 1
    })
  }

  const incrementSession = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('incrementSession')
    }
    setCurrentTask((prevTask: Task) => ({
      ...prevTask,
      sessionCount: Math.min((prevTask.sessionCount || 1) + 1, 1000)
    }))
  }, [setCurrentTask])

  const updateTask = useCallback(
    (duration: number, status?: TaskStatus) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('updateTask', duration)
      }
      setCurrentTask((prevTask: Task) => ({
        ...prevTask,
        taskDuration: duration,
        taskStatus: status ?? prevTask.taskStatus
      }))
    },
    [setCurrentTask]
  )

  const pastComplete = useCallback(
    (elapsedTime: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('pastComplete', elapsedTime)
      }
      setCurrentTask((prevTask: Task) => ({
        ...prevTask,
        taskDuration: 0,
        fullDuration: elapsedTime,
        taskStatus: 'end'
      }))
    },
    [setCurrentTask]
  )

  // taskList를 taskName별로 그룹화
  const groupedTaskList = useCallback((): GroupedTask[] => {
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
  const dailyTaskList = useCallback((): DailyTaskSummary[] => {
    const grouped = taskList.reduce(
      (acc, task) => {
        // dayjs는 자동으로 로컬 시간대를 사용
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
    // 최신순으로 정렬
    return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))
  }, [taskList])

  const saveTaskToList = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('saveTaskToList')
    }

    // 완료된 task만 저장
    if (currentTask.taskStatus === 'end' && currentTask.taskName) {
      // 오늘 날짜 (YYYY-MM-DD 형식) - dayjs로 로컬 시간대 적용
      const today = dayjs().format('YYYY-MM-DD')

      // 같은 날짜, 같은 이름의 task 개수 계산
      const sameTasks = taskList.filter((task) => {
        const taskDate = task.date ? dayjs(task.date).format('YYYY-MM-DD') : ''
        return task.taskName === currentTask.taskName && taskDate === today
      })

      // sessionCount 업데이트 (당일 반복 횟수)
      const updatedTask = {
        ...currentTask,
        sessionCount: sameTasks.length + 1
      }

      setTaskList((prevList) => [...prevList, updatedTask])
    }
  }, [currentTask, taskList, setTaskList])

  // 특정 날짜의 특정 이름을 가진 모든 태스크 삭제
  const deleteTasksByNameAndDate = useCallback(
    (taskName: string, date: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('deleteTasksByNameAndDate', taskName, date)
      }
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
        currentTask: currentTask as Task,
        taskStatus: currentTask?.taskStatus ?? 'idle',
        taskList,
        groupedTaskList: groupedTaskList(),
        dailyTaskList: dailyTaskList(),
        resetCurrentTask,
        updateTask,
        pastComplete,
        startTask,
        reStartTask,
        incrementSession,
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
