import { localDayKey } from './records'
import type { FocusState } from './store'

export type DailySuggestionDecision = {
  day: string
  decision: 'selected' | 'skipped'
  revision: number
  updatedAt: number
  updatedBy: string
}

export const FIRST_FOCUS_TASK = '오늘 할 일 생각해보기'
export const FIRST_FOCUS_MS = 5 * 60_000

/** Invoke on first entry, and persist a selected/skipped decision when leaving that entry. */
export function canSuggestFirstFocus(
  state: FocusState,
  { now, task = '', syncEnabled = false, syncReady = false, dayKey = localDayKey }: {
    now: number; task?: string; syncEnabled?: boolean; syncReady?: boolean
    dayKey?: (time: number) => string
  }
): boolean {
  if (task.trim() || state.current || state.conflicts?.length || (syncEnabled && !syncReady)) return false
  const day = dayKey(now)
  if (state.firstSuggestions?.some((item) => item.day === day)) return false
  // A deleted record must not make a day with a completed focus look like a first visit again.
  const records = [...state.records, ...(state.recordChanges ?? []).flatMap((item) => item.record ? [item.record] : [])]
  return !records.some((record) => dayKey(record.startedAt) === day || dayKey(record.finishedAt) === day)
}
