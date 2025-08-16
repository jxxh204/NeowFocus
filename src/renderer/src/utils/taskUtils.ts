export interface Task {
  date: string
  taskName: string
  taskDuration: number
  fullDuration: number
  taskStatus: 'idle' | 'play' | 'end'
}

export const createTask = (
  taskName: string, 
  duration: number = 1500
): Task => {
  return {
    date: new Date().toISOString(),
    taskName,
    taskDuration: duration,
    fullDuration: duration,
    taskStatus: 'idle'
  }
}

export const resetTask = (task: Task): Task => {
  return {
    ...task,
    taskDuration: task.fullDuration,
    taskStatus: 'idle'
  }
}

export const updateTaskDuration = (task: Task, newDuration: number): Task => {
  return {
    ...task,
    taskDuration: newDuration
  }
}

export const updateTaskStatus = (
  task: Task, 
  status: Task['taskStatus']
): Task => {
  return {
    ...task,
    taskStatus: status
  }
}

export const isTaskActive = (task: Task): boolean => {
  return task.taskStatus === 'play'
}

export const isTaskCompleted = (task: Task): boolean => {
  return task.taskStatus === 'end'
}