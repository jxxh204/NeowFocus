import { createContext, useContext, useState } from 'react'

type Task = {
  date: string
  taskName: string
  taskDuration: number
  fullDuration: number
}

type TaskContextType = {
  currentTask: Task
  isTaskEnd: boolean
  initCurrentTask: (taskName: string) => void
  resetCurrentTask: () => void
  updateDuration: (duration: number) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTask, setCurrentTask] = useState<Task>({
    date: '', // 태스크가 생성된 날짜 (ISO 문자열 형식)
    taskName: '', // 태스크 이름
    taskDuration: 0, // 현재까지 진행된 시간
    fullDuration: 1600 // 태스크 총 시간
  })
  const resetCurrentTask = () => {
    setCurrentTask({
      date: '',
      taskName: '',
      taskDuration: 0,
      fullDuration: 0
    })
  }
  const initCurrentTask = (taskName: string) => {
    setCurrentTask({
      date: new Date().toISOString(),
      taskName: taskName,
      taskDuration: 0,
      fullDuration: 1600
    })
  }
  const updateDuration = (duration: number) => {
    setCurrentTask({
      ...currentTask,
      taskDuration: duration
    })
  }

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        isTaskEnd: currentTask.taskDuration <= 0,
        resetCurrentTask,
        initCurrentTask,
        updateDuration
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
