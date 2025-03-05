import { createContext, useContext, useState } from 'react'

type Task = {
  date: string
  taskName: string
  taskMinute: number
}

type TaskContextType = {
  currentTask: Task
  initCurrentTask: () => void
  updateCurrentTask: (taskName: string) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTask, setCurrentTask] = useState<Task>({
    date: '',
    taskName: '',
    taskMinute: 0
  })
  const initCurrentTask = () => {
    setCurrentTask({
      date: '',
      taskName: '',
      taskMinute: 0
    })
  }
  const updateCurrentTask = (taskName: string) => {
    setCurrentTask({
      date: new Date().toISOString(),
      taskName,
      taskMinute: 25
    })
  }

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        initCurrentTask,
        updateCurrentTask
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
