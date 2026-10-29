import { describe, expect, it } from 'vitest'
import { focusCalendarDays } from './calendar'
import type { FocusRecord } from './records'
import { EMPTY_STATE, focusReducer } from './store'

const at = new Date(2026, 9, 22, 12).getTime()
const record = (id: string, focusedMs = 25 * 60_000, finishedAt = at): FocusRecord => ({
  id, task: '비공개 작업', startedAt: finishedAt - focusedMs, finishedAt, focusedMs, plannedMs: focusedMs,
  completed: true, finishReason: 'completed'
})
describe('daily calendar summaries', () => {
  it('aggregates actual focus time once per session, without private task titles', () => {
    const a = record('a'), b = record('b', 60 * 60_000)
    const days = focusCalendarDays({ ...EMPTY_STATE, records: [a, a, b, { ...record('conflict'), finishReason: 'conflict' }] })
    expect(days).toEqual([{ day: '2026-10-22', count: 2, focusedMs: 85 * 60_000, title: '냐우포커스 · 2회 · 1시간 25분' }])
    expect(JSON.stringify(days)).not.toContain(a.task)
  })
  it('uses local finish-day, including midnight and manually ended short sessions', () => {
    const days = focusCalendarDays({ ...EMPTY_STATE, records: [record('yesterday', 60_000, new Date(2026, 9, 21, 23, 59).getTime()),
      { ...record('today', 10_000, new Date(2026, 9, 22, 0, 1).getTime()), completed: false, finishReason: 'manual' }] })
    expect(days.map(day => [day.day, day.count, day.title])).toEqual([
      ['2026-10-21', 1, '냐우포커스 · 1회 · 1분'], ['2026-10-22', 1, '냐우포커스 · 1회 · 10초']
    ])
  })
  it('clears an emptied day and restores its summary on undo', () => {
    const initial = { ...EMPTY_STATE, records: [record('a')] }
    const deleted = focusReducer(initial, { type: 'deleteRecord', id: 'a', now: at + 1, deviceId: 'phone' })
    expect(focusCalendarDays(deleted)[0]).toMatchObject({ count: 0, focusedMs: 0 })
    const restored = focusReducer(deleted, { type: 'undoDeleteRecord', id: 'a', now: at + 2, deviceId: 'phone' })
    expect(focusCalendarDays(restored)[0]).toMatchObject({ count: 1, focusedMs: 25 * 60_000 })
  })
  it('clears an earlier summary when conflict resolution excludes its last session', () => {
    expect(focusCalendarDays({ ...EMPTY_STATE, records: [{ ...record('a'), finishReason: 'conflict' }] })[0])
      .toMatchObject({ count: 0, focusedMs: 0 })
  })
})
