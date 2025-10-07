import { createContext, useContext, useRef, useCallback } from 'react'
import { useLocalStorage } from '@renderer/hooks/useLocalStorage'
import { TIME } from '@renderer/constants'
import { v4 as uuidv4 } from 'uuid'

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

type TaskContextType = {
  currentTask: Task
  taskStatus: TaskStatus
  taskList: Task[]
  groupedTaskList: GroupedTask[]
  resetCurrentTask: () => void
  updateTask: (duration: number, status?: TaskStatus) => void
  startTask: (taskName: string) => void
  reStartTask: () => void
  incrementSession: () => void
  saveTaskToList: () => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const taskDuration = useRef(TIME.DEFAULT_POMODORO_DURATION)

  const [currentTask, setCurrentTask] = useLocalStorage<Task>('currentTask', {
    id: uuidv4(), // 고유 식별자
    date: '', // 태스크가 생성된 날짜 (ISO 문자열 형식)
    taskName: '', // 태스크 이름
    taskDuration: taskDuration.current, // 현재까지 진행된 시간
    fullDuration: taskDuration.current, // 태스크 총 시간
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
      fullDuration: taskDuration.current,
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
      taskDuration: taskDuration.current,
      fullDuration: taskDuration.current,
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
      taskDuration: currentTask?.fullDuration ?? 0,
      fullDuration: currentTask?.fullDuration ?? 0,
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

  const saveTaskToList = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('saveTaskToList')
    }

    // 완료된 task만 저장
    if (currentTask.taskStatus === 'end' && currentTask.taskName) {
      // 오늘 날짜 (YYYY-MM-DD 형식)
      const today = new Date().toISOString().split('T')[0]

      // 같은 날짜, 같은 이름의 task 개수 계산
      const sameTasks = taskList.filter((task) => {
        const taskDate = task.date ? new Date(task.date).toISOString().split('T')[0] : ''
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

  return (
    <TaskContext.Provider
      value={{
        currentTask: currentTask as Task,
        taskStatus: currentTask?.taskStatus ?? 'idle',
        taskList,
        groupedTaskList: groupedTaskList(),
        resetCurrentTask,
        updateTask,
        startTask,
        reStartTask,
        incrementSession,
        saveTaskToList
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
