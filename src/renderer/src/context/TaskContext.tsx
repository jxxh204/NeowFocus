import { createContext, useContext, useRef } from 'react'
import { useLocalStorage } from '@renderer/hooks/useLocalStorage'

export type TaskStatus = 'idle' | 'play' | 'end'

export type Task = {
  date: string
  taskName: string
  taskDuration: number
  fullDuration: number
  taskStatus: TaskStatus
}

type TaskContextType = {
  currentTask: Task
  taskStatus: TaskStatus
  resetCurrentTask: () => void
  updateTask: (duration: number, status?: TaskStatus) => void
  startTask: (taskName: string) => void
  reStartTask: () => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const taskDuration = useRef(1500)

  const [currentTask, setCurrentTask] = useLocalStorage<Task>('currentTask', {
    date: '', // 태스크가 생성된 날짜 (ISO 문자열 형식)
    taskName: '', // 태스크 이름
    taskDuration: taskDuration.current, // 현재까지 진행된 시간
    fullDuration: taskDuration.current, // 태스크 총 시간
    taskStatus: 'idle' // 태스크 상태
  })

  const resetCurrentTask = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('resetCurrentTask')
    }
    setCurrentTask({
      date: '',
      taskName: '',
      taskDuration: 0,
      fullDuration: taskDuration.current,
      taskStatus: 'idle'
    })
  }

  const reStartTask = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('reStartTask')
    }
    setCurrentTask({
      date: new Date().toISOString(),
      taskName: currentTask?.taskName ?? '',
      taskDuration: currentTask?.fullDuration ?? 0,
      fullDuration: currentTask?.fullDuration ?? 0,
      taskStatus: 'play'
    })
  }

  const startTask = (taskName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('startTask', taskName)
    }
    setCurrentTask({
      date: new Date().toISOString(),
      taskName: taskName,
      taskDuration: currentTask?.fullDuration ?? 0,
      fullDuration: currentTask?.fullDuration ?? 0,
      taskStatus: 'play'
    })
  }

  const updateTask = (duration: number, status?: TaskStatus) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('updateTask', duration)
    }
    const updatedTask = {
      ...currentTask,
      taskDuration: duration,
      taskStatus: status ?? currentTask?.taskStatus ?? 'idle'
    }
    setCurrentTask(updatedTask as Task)
  }

  return (
    <TaskContext.Provider
      value={{
        currentTask: currentTask as Task,
        taskStatus: currentTask?.taskStatus ?? 'idle',
        resetCurrentTask,
        updateTask,
        startTask,
        reStartTask
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
