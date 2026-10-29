import { EMPTY_STATE, serializeFocusState, startFocus } from '@neowfocus/core'
import { DESKTOP_FOCUS_KEY, LEGACY_BACKUP_KEY, loadDesktopFocus } from '../desktopFocusStorage'

const NOW = new Date('2026-10-13T09:00:00Z').getTime()

describe('desktop focus migration', () => {
  beforeEach(() => localStorage.clear())

  it('backs up the original values before migrating records and a live session', () => {
    const taskList = JSON.stringify([
      {
        id: 'old-1',
        date: '2026-10-12T09:00:00Z',
        taskName: '이전 집중',
        fullDuration: 1500,
        sessionCount: 1
      },
      {
        id: 'old-2',
        date: '2026-10-12T10:00:00Z',
        taskName: '이전 집중',
        fullDuration: 600,
        sessionCount: 2
      }
    ])
    const currentTask = JSON.stringify({
      id: 'current',
      date: '2026-10-13T08:00:00Z',
      taskName: '진행 중',
      fullDuration: 1500,
      taskDuration: 600,
      taskStatus: 'pause'
    })
    localStorage.setItem('taskList', taskList)
    localStorage.setItem('currentTask', currentTask)
    const result = loadDesktopFocus('mac', NOW)
    expect(result.records).toHaveLength(2)
    expect(result.records[0].focusedMs).toBe(1500000)
    expect(result.current).toMatchObject({ id: 'current', status: 'paused', remainingMs: 600000 })
    const backup = JSON.parse(localStorage.getItem(LEGACY_BACKUP_KEY)!)
    expect(backup.taskList).toBe(taskList)
    expect(backup.currentTask).toBe(currentTask)
    expect(localStorage.getItem('currentTask')).toBeNull()
    expect(loadDesktopFocus('mac', NOW)).toEqual(result)
  })

  it('does not reimport compatibility records after their deletion from shared state', () => {
    localStorage.setItem(
      'taskList',
      JSON.stringify([
        { id: 'deleted', date: '2026-10-12', taskName: '삭제한 일', fullDuration: 60 }
      ])
    )
    localStorage.setItem(DESKTOP_FOCUS_KEY, serializeFocusState(EMPTY_STATE))
    expect(loadDesktopFocus('mac', NOW).records).toEqual([])
  })

  it('keeps distinct historical entries even when legacy identifiers were duplicated', () => {
    localStorage.setItem(
      'taskList',
      JSON.stringify([
        { id: 'same', date: '2026-10-12T09:00:00Z', taskName: '첫째', fullDuration: 1500 },
        { id: 'same', date: '2026-10-12T10:00:00Z', taskName: '둘째', fullDuration: 1500 }
      ])
    )
    const state = loadDesktopFocus('mac', NOW)
    expect(state.records).toHaveLength(2)
    expect(new Set(state.records.map((record) => record.id)).size).toBe(2)
  })

  it('settles an expired local session and saves its completion once', () => {
    const current = startFocus({
      id: 'ended',
      task: '지난 집중',
      plannedMs: 300000,
      now: NOW - 600000,
      deviceId: 'mac'
    })
    localStorage.setItem('focusSession', JSON.stringify(current))
    const state = loadDesktopFocus('mac', NOW)
    expect(state.current?.status).toBe('finished')
    expect(state.records.map((record) => record.id)).toEqual(['ended'])
    expect(loadDesktopFocus('mac', NOW).records).toHaveLength(1)
  })

  it('does not resurrect an older task when the newer session key explicitly says empty', () => {
    localStorage.setItem('focusSession', 'null')
    localStorage.setItem('currentTask', JSON.stringify({ id: 'stale', taskName: '이전 잔여 값', taskDuration: 600, fullDuration: 1500, taskStatus: 'play' }))
    expect(loadDesktopFocus('mac', NOW).current).toBeNull()
  })

  it('leaves unsupported state bytes untouched instead of overwriting newer data', () => {
    const original = '{"schemaVersion":99,"state":{"future":"important"}}'
    localStorage.setItem(DESKTOP_FOCUS_KEY, original)
    expect(() => loadDesktopFocus('mac', NOW)).toThrow('기존 데이터')
    expect(localStorage.getItem(DESKTOP_FOCUS_KEY)).toBe(original)
  })
})
