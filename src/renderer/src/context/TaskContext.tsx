import { createContext, useContext, useState } from 'react'

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
}

const TaskContext = createContext<TaskContextType | null>(null)

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTask, setCurrentTask] = useState<Task>({
    date: '', // 태스크가 생성된 날짜 (ISO 문자열 형식)
    taskName: '', // 태스크 이름
    taskDuration: 0, // 현재까지 진행된 시간
    fullDuration: 100, // 태스크 총 시간
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
      fullDuration: 0,
      taskStatus: 'idle'
    })
  }
  const startTask = (taskName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('startTask', taskName)
    }
    setCurrentTask({
      date: new Date().toISOString(),
      taskName: taskName,
      taskDuration: currentTask.fullDuration,
      fullDuration: currentTask.fullDuration,
      taskStatus: 'play'
    })
  }
  const updateTask = (duration: number, status?: TaskStatus) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('updateTask', duration)
    }
    setCurrentTask({
      ...currentTask,
      taskDuration: duration,
      taskStatus: status ?? currentTask.taskStatus
    })
  }

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        taskStatus: currentTask.taskStatus,
        resetCurrentTask,
        updateTask,
        startTask
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
