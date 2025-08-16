import {
  createTask,
  resetTask,
  updateTaskDuration,
  updateTaskStatus,
  isTaskActive,
  isTaskCompleted,
  Task
} from '../taskUtils'

describe('taskUtils', () => {
  const mockDate = '2024-01-01T12:00:00.000Z'
  
  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createTask', () => {
    it('should create a task with default duration', () => {
      const task = createTask('Test Task')
      
      expect(task).toEqual({
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'idle'
      })
    })

    it('should create a task with custom duration', () => {
      const task = createTask('Custom Task', 3000)
      
      expect(task).toEqual({
        date: mockDate,
        taskName: 'Custom Task',
        taskDuration: 3000,
        fullDuration: 3000,
        taskStatus: 'idle'
      })
    })
  })

  describe('resetTask', () => {
    it('should reset task to initial state', () => {
      const task: Task = {
        date: '2024-01-01T10:00:00.000Z',
        taskName: 'Test Task',
        taskDuration: 500,
        fullDuration: 1500,
        taskStatus: 'play'
      }
      
      const resetedTask = resetTask(task)
      
      expect(resetedTask).toEqual({
        date: '2024-01-01T10:00:00.000Z',
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'idle'
      })
    })
  })

  describe('updateTaskDuration', () => {
    it('should update task duration', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'play'
      }
      
      const updatedTask = updateTaskDuration(task, 1000)
      
      expect(updatedTask.taskDuration).toBe(1000)
      expect(updatedTask.fullDuration).toBe(1500)
      expect(updatedTask.taskStatus).toBe('play')
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status to play', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'idle'
      }
      
      const updatedTask = updateTaskStatus(task, 'play')
      
      expect(updatedTask.taskStatus).toBe('play')
      expect(updatedTask.taskDuration).toBe(1500)
    })

    it('should update task status to end', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 0,
        fullDuration: 1500,
        taskStatus: 'play'
      }
      
      const updatedTask = updateTaskStatus(task, 'end')
      
      expect(updatedTask.taskStatus).toBe('end')
    })
  })

  describe('isTaskActive', () => {
    it('should return true for active task', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'play'
      }
      
      expect(isTaskActive(task)).toBe(true)
    })

    it('should return false for idle task', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'idle'
      }
      
      expect(isTaskActive(task)).toBe(false)
    })

    it('should return false for ended task', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 0,
        fullDuration: 1500,
        taskStatus: 'end'
      }
      
      expect(isTaskActive(task)).toBe(false)
    })
  })

  describe('isTaskCompleted', () => {
    it('should return true for completed task', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 0,
        fullDuration: 1500,
        taskStatus: 'end'
      }
      
      expect(isTaskCompleted(task)).toBe(true)
    })

    it('should return false for active task', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 750,
        fullDuration: 1500,
        taskStatus: 'play'
      }
      
      expect(isTaskCompleted(task)).toBe(false)
    })

    it('should return false for idle task', () => {
      const task: Task = {
        date: mockDate,
        taskName: 'Test Task',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'idle'
      }
      
      expect(isTaskCompleted(task)).toBe(false)
    })
  })
})