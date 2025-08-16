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