import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { TaskProvider, useTaskContext } from '../TaskContext'

describe('TaskContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TaskProvider>{children}</TaskProvider>
  )

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should provide default task values', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      expect(result.current.currentTask).toEqual({
        date: expect.any(String),
        taskName: '',
        taskDuration: 1500,
        fullDuration: 1500,
        taskStatus: 'idle'
      })
    })

    it('should load task from localStorage if exists', () => {
      const savedTask = {
        date: '2024-01-01T10:00:00.000Z',
        taskName: 'Saved Task',
        taskDuration: 1000,
        fullDuration: 1800,
        taskStatus: 'play' as const
      }
      
      localStorage.setItem('currentTask', JSON.stringify(savedTask))
      
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      expect(result.current.currentTask).toEqual(savedTask)
    })
  })

  describe('resetCurrentTask', () => {
    it('should reset the current task', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      // First, start a task
      act(() => {
        result.current.startTask('Test Task')
      })
      
      // Then reset it
      act(() => {
        result.current.resetCurrentTask()
      })
      
      expect(result.current.currentTask.taskName).toBe('')
      expect(result.current.currentTask.taskDuration).toBe(0)
      expect(result.current.currentTask.taskStatus).toBe('idle')
    })
  })

  describe('startTask', () => {
    it('should start a new task with given name', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      act(() => {
        result.current.startTask('Test Task')
      })
      
      expect(result.current.currentTask.taskName).toBe('Test Task')
      expect(result.current.currentTask.taskStatus).toBe('play')
      expect(result.current.currentTask.taskDuration).toBe(1500)
      expect(result.current.currentTask.fullDuration).toBe(1500)
    })
  })

  describe('reStartTask', () => {
    it('should restart the current task', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      // First, start and modify a task
      act(() => {
        result.current.startTask('Test Task')
      })
      
      act(() => {
        result.current.updateTask(500, 'end')
      })
      
      // Restart the task
      act(() => {
        result.current.reStartTask()
      })
      
      expect(result.current.currentTask.taskDuration).toBe(1500)
      expect(result.current.currentTask.taskStatus).toBe('play')
      expect(result.current.currentTask.taskName).toBe('Test Task')
    })
  })

  describe('taskStatus', () => {
    it('should reflect the current task status', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      expect(result.current.taskStatus).toBe('idle')
      
      act(() => {
        result.current.startTask('Test Task')
      })
      
      expect(result.current.taskStatus).toBe('play')
      
      act(() => {
        result.current.updateTask(0, 'end')
      })
      
      expect(result.current.taskStatus).toBe('end')
    })
  })

  describe('updateTask', () => {
    it('should update task duration', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      act(() => {
        result.current.startTask('Test Task')
      })
      
      act(() => {
        result.current.updateTask(1200)
      })
      
      expect(result.current.currentTask.taskDuration).toBe(1200)
    })

    it('should update task status when provided', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      
      act(() => {
        result.current.startTask('Test Task')
      })
      
      act(() => {
        result.current.updateTask(0, 'end')
      })
      
      expect(result.current.currentTask.taskDuration).toBe(0)
      expect(result.current.currentTask.taskStatus).toBe('end')
    })
  })

  describe('saveTaskToList', () => {
    it('should save completed task to task list', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })

      act(() => {
        result.current.startTask('Test Task')
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList).toHaveLength(1)
      expect(result.current.taskList[0].taskName).toBe('Test Task')
      expect(result.current.taskList[0].sessionCount).toBe(1)
    })

    it('should calculate session count based on same date and same task name', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })
      // const today = new Date().toISOString()

      // First session
      act(() => {
        result.current.startTask('Test Task')
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList[0].sessionCount).toBe(1)

      // Second session (same day, same task)
      act(() => {
        result.current.reStartTask()
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList).toHaveLength(2)
      expect(result.current.taskList[1].sessionCount).toBe(2)

      // Third session (same day, same task)
      act(() => {
        result.current.reStartTask()
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList).toHaveLength(3)
      expect(result.current.taskList[2].sessionCount).toBe(3)
    })

    it('should reset session count for different task name on same day', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })

      // First task - first session
      act(() => {
        result.current.startTask('Task A')
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList[0].sessionCount).toBe(1)

      // First task - second session
      act(() => {
        result.current.reStartTask()
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList[1].sessionCount).toBe(2)

      // Different task - should start from 1
      act(() => {
        result.current.startTask('Task B')
      })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList).toHaveLength(3)
      expect(result.current.taskList[2].sessionCount).toBe(1)
    })

    it('should reset session count for same task name on different day', () => {
      const { result: _result } = renderHook(() => useTaskContext(), { wrapper })

      // Mock yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // Create a task from yesterday
      const yesterdayTask = {
        id: 'test-id-1',
        date: yesterday.toISOString(),
        taskName: 'Test Task',
        taskDuration: 0,
        fullDuration: 1500,
        taskStatus: 'end' as const,
        sessionCount: 2 // Had 2 sessions yesterday
      }

      // Manually add yesterday's task to localStorage
      localStorage.setItem('taskList', JSON.stringify([yesterdayTask]))

      // Re-render to load the saved task list
      const { result: newResult } = renderHook(() => useTaskContext(), { wrapper })

      expect(newResult.current.taskList).toHaveLength(1)
      expect(newResult.current.taskList[0].sessionCount).toBe(2)

      // Start same task today
      act(() => {
        newResult.current.startTask('Test Task')
      })

      act(() => {
        newResult.current.updateTask(0, 'end')
      })

      act(() => {
        newResult.current.saveTaskToList()
      })

      // Should start from 1 for today (not 3)
      expect(newResult.current.taskList).toHaveLength(2)
      expect(newResult.current.taskList[1].sessionCount).toBe(1)
    })

    it('should not save task if status is not end', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })

      act(() => {
        result.current.startTask('Test Task')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList).toHaveLength(0)
    })

    it('should not save task if taskName is empty', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper })

      act(() => {
        result.current.updateTask(0, 'end')
      })

      act(() => {
        result.current.saveTaskToList()
      })

      expect(result.current.taskList).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('should throw error when useTaskContext is used outside provider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useTaskContext())
      }).toThrow('useTaskContext must be used within a TaskProvider')

      consoleErrorSpy.mockRestore()
    })
  })
})