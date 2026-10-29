import { localDayKey, type FocusRecord } from './records'
import type { FocusSession } from './session'
import { mergeRecords } from './sync'

export function achievementForDay(records: FocusRecord[], now: number) {
  const day = localDayKey(now)
  const today = mergeRecords([], records)
    .filter(record => record.finishReason !== 'conflict' && localDayKey(record.finishedAt) === day)
    .sort((a, b) => a.finishedAt - b.finishedAt)
  return { day, count: today.length, focusedMs: today.reduce((sum, record) => sum + record.focusedMs, 0),
    tasks: [...new Set(today.map(record => record.task))], records: today }
}

/** A local, fresh state transition may sound once; restore/sync/history must stay quiet. */
export function isFeedbackCompletion(previous: FocusSession | null, current: FocusSession | null, deviceId: string, now: number, foregroundSince = -Infinity) {
  if (!previous || !current || previous.id !== current.id || current.status !== 'finished'
    || !['running', 'paused'].includes(previous.status) || current.finishReason === 'conflict'
    || current.finishedAt === null || current.finishedAt < foregroundSince
    || now < current.finishedAt || now - current.finishedAt >= 3000) return false
  return current.finishReason === 'manual' || !current.completed ? current.updatedBy === deviceId
    : (current.startedBy ?? current.updatedBy) === deviceId
}
