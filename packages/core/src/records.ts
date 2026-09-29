import type { FocusSession } from './session'

/** 마친 집중 한 번. 세션 id를 그대로 써서 어느 기기에서 마쳐도 한 건이 된다. */
export type FocusRecord = {
  id: string
  task: string
  plannedMs: number
  focusedMs: number
  completed: boolean
  startedAt: number
  finishedAt: number
}

export type DayRecords = {
  /** 기기 현지 시간 기준 YYYY-MM-DD */
  day: string
  records: FocusRecord[]
  focusedMs: number
}

/** 이보다 짧게 마친 집중은 실수로 시작한 것으로 보고 기록하지 않는다. */
export const MIN_RECORD_MS = 60_000

export function toRecord(session: FocusSession): FocusRecord | null {
  if (session.status !== 'finished' || session.finishedAt === null) return null
  if (session.focusedMs < MIN_RECORD_MS) return null
  return {
    id: session.id,
    task: session.task,
    plannedMs: session.plannedMs,
    focusedMs: session.focusedMs,
    completed: session.completed,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt
  }
}

export function localDayKey(time: number): string {
  const d = new Date(time)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** 날짜별로 묶어 최신 날짜, 최신 기록 순으로 돌려준다. */
export function groupRecordsByDay(records: FocusRecord[], dayKey = localDayKey): DayRecords[] {
  const byDay = new Map<string, DayRecords>()
  for (const record of [...records].sort((a, b) => b.finishedAt - a.finishedAt)) {
    const day = dayKey(record.finishedAt)
    const group = byDay.get(day) ?? { day, records: [], focusedMs: 0 }
    group.records.push(record)
    group.focusedMs += record.focusedMs
    byDay.set(day, group)
  }
  return [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day))
}
