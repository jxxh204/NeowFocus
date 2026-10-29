import React from 'react'
import { act, renderHook } from '@testing-library/react'
import {
  EMPTY_STATE,
  localDayKey,
  parseSyncEnvelope,
  serializeFocusState,
  startFocus,
  type FocusState
} from '@neowfocus/core'
import { TaskProvider, useTaskContext } from '../TaskContext'
import { SettingsProvider } from '../SettingsContext'

const NOW = new Date('2026-10-13T09:00:00Z').getTime()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <TaskProvider>{children}</TaskProvider>
  </SettingsProvider>
)
const render = () => renderHook(() => useTaskContext(), { wrapper })
const flush = () =>
  act(async () => {
    for (let index = 0; index < 15; index++) await Promise.resolve()
  })

describe('desktop focus sharing', () => {
  let cloud: FocusState
  let change: (() => void) | undefined
  let unsubscribe: jest.Mock
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    localStorage.clear()
    localStorage.setItem('deviceId', 'mac')
    cloud = { ...EMPTY_STATE }
    change = undefined
    unsubscribe = jest.fn()
    Object.assign(window.electron, {
      focusCloudSubscribe: jest.fn(async () => {}),
      onFocusCloudChanged: jest.fn((callback: () => void) => { change = callback; return unsubscribe }),
      focusCloudCapabilities: jest.fn(async () => ({ available: true })),
      focusCloudRead: jest.fn(async () => ({ json: serializeFocusState(cloud), changeTag: 'tag' })),
      focusCloudWrite: jest.fn(async (json: string) => {
        cloud = parseSyncEnvelope(json)!
        return 'tag-next'
      }),
      showNotification: jest.fn(),
      showWindow: jest.fn()
    })
  })
  afterEach(() => jest.useRealTimers())

  it('reads on change notification, not every five seconds, and detaches on disconnect', async () => {
    const { result } = render()
    act(() => result.current.setSyncEnabled(true))
    await flush()
    const reads = (window.electron.focusCloudRead as jest.Mock).mock.calls.length
    act(() => jest.advanceTimersByTime(30000))
    await flush()
    expect(window.electron.focusCloudRead).toHaveBeenCalledTimes(reads)
    cloud = { current: startFocus({ id: 'remote', task: '변경 알림', plannedMs: 600000, now: NOW + 30000, deviceId: 'phone' }), records: [] }
    act(() => change?.())
    await flush()
    expect(result.current.currentTask.taskName).toBe('변경 알림')
    act(() => result.current.setSyncEnabled(false))
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('does not contact iCloud until explicitly enabled, and preserves records when disconnected', async () => {
    const { result } = render()
    await flush()
    expect(window.electron.focusCloudRead).not.toHaveBeenCalled()
    act(() => result.current.startTask('로컬 집중'))
    act(() => jest.advanceTimersByTime(120000))
    act(() => result.current.completeEarly())
    act(() => result.current.setSyncEnabled(true))
    await flush()
    expect(result.current.syncStatus).toBe('synced')
    expect(cloud.records).toHaveLength(1)
    act(() => result.current.setSyncEnabled(false))
    expect(result.current.taskList).toHaveLength(1)
    expect(result.current.syncStatus).toBe('off')
  })

  it('receives a phone focus and does not announce completion on the receiving Mac', async () => {
    cloud = {
      current: startFocus({
        id: 'phone',
        task: '폰 집중',
        plannedMs: 60000,
        now: NOW,
        deviceId: 'phone'
      }),
      records: []
    }
    const { result } = render()
    act(() => result.current.setSyncEnabled(true))
    await flush()
    expect(result.current.currentTask.taskName).toBe('폰 집중')
    act(() => jest.advanceTimersByTime(60000))
    await flush()
    expect(result.current.taskStatus).toBe('end')
    expect(window.electron.showNotification).not.toHaveBeenCalled()
    expect(result.current.taskList).toHaveLength(1)
  })

  it('preserves both offline sessions and waits for an explicit choice', async () => {
    cloud = {
      current: startFocus({
        id: 'phone',
        task: '폰 집중',
        plannedMs: 600000,
        now: NOW,
        deviceId: 'phone'
      }),
      records: []
    }
    const { result } = render()
    act(() => result.current.startTask('맥 집중'))
    const macId = result.current.currentTask.id
    act(() => result.current.setSyncEnabled(true))
    await flush()
    expect(result.current.focusState.conflicts).toHaveLength(2)
    act(() => result.current.resolveConflict(macId))
    await flush()
    expect(result.current.focusState.conflicts).toEqual([])
    expect(result.current.currentTask.taskName).toBe('맥 집중')
    expect(result.current.taskList.some((task) => task.id === 'phone')).toBe(true)
  })

  it('deletes a group and restores it without recreating duplicates', () => {
    const { result } = render()
    act(() => result.current.startTask('기록'))
    act(() => jest.advanceTimersByTime(120000))
    act(() => result.current.completeEarly())
    act(() => result.current.saveTaskToList())
    expect(result.current.taskList).toHaveLength(1)
    act(() => result.current.deleteTasksByNameAndDate('기록', localDayKey(NOW)))
    expect(result.current.taskList).toHaveLength(0)
    expect(result.current.focusState.recordChanges?.[0].deleted).toBe(true)
    act(() => result.current.undoDeletedTasks())
    expect(result.current.taskList).toHaveLength(1)
    expect(result.current.focusState.recordChanges?.[0].deleted).toBe(false)
  })
})
