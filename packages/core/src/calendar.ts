import type { FocusState } from './store'
import { localDayKey } from './records'
import { mergeRecords } from './sync'

export type FocusCalendarDay = { day: string; count: number; focusedMs: number; title: string }

/** Same finish-day/count policy as achievements. Tombstones also repair an emptied day. */
export function focusCalendarDays(state: FocusState, dayKey = localDayKey): FocusCalendarDay[] {
  const days = new Map<string, { count: number; focusedMs: number }>()
  for (const change of state.recordChanges ?? []) days.set(dayKey(change.record.finishedAt), { count: 0, focusedMs: 0 })
  for (const record of mergeRecords([], state.records)) {
    const day = dayKey(record.finishedAt)
    const summary = days.get(day) ?? { count: 0, focusedMs: 0 }
    if (record.finishReason !== 'conflict') {
      summary.count++
      summary.focusedMs += record.focusedMs
    }
    days.set(day, summary)
  }
  return [...days].sort(([a], [b]) => a.localeCompare(b)).map(([day, value]) => ({
    day, ...value, title: `냐우포커스 · ${value.count}회 · ${calendarDuration(value.focusedMs)}`
  }))
}

export function calendarDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}시간${minutes % 60 ? ` ${minutes % 60}분` : ''}`
    : minutes > 0 ? `${minutes}분` : `${seconds}초`
}
