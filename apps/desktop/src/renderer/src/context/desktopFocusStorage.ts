import {
  focusReducer,
  parseFocusState,
  serializeFocusState,
  type FocusRecord,
  type FocusState
} from '@neowfocus/core'
import { sessionFromLegacyTask, type LegacyTask } from './legacySession'

export const DESKTOP_FOCUS_KEY = 'neowfocus.focus.v1'
export const LEGACY_BACKUP_KEY = 'neowfocus.legacy.backup.v1'

function json(value: string | null): unknown {
  try {
    return value === null ? null : JSON.parse(value)
  } catch {
    return null
  }
}

/** The exact source values stay in a backup before any compatibility key is rewritten. */
export function loadDesktopFocus(deviceId: string, now: number): FocusState {
  const saved = localStorage.getItem(DESKTOP_FOCUS_KEY)
  if (saved !== null) {
    const state = parseFocusState(saved)
    if (state) return focusReducer(state, { type: 'tick', now })
    // An unsupported envelope must never be overwritten by an empty/migrated state.
    throw new Error('저장된 집중 데이터를 읽을 수 없어요. 기존 데이터는 그대로 보관했어요.')
  }
  if (localStorage.getItem(LEGACY_BACKUP_KEY) === null) {
    localStorage.setItem(
      LEGACY_BACKUP_KEY,
      JSON.stringify({
        migratedAt: now,
        currentTask: localStorage.getItem('currentTask'),
        focusSession: localStorage.getItem('focusSession'),
        taskList: localStorage.getItem('taskList')
      })
    )
  }
  const sessionRaw = localStorage.getItem('focusSession')
  const oldSession = json(sessionRaw)
  if (sessionRaw !== null && sessionRaw !== 'null' && oldSession === null)
    throw new Error('이전 집중 데이터를 읽을 수 없어요. 원본 백업은 유지했어요.')
  const candidate =
    oldSession === null
      ? null
      : parseFocusState(JSON.stringify({ current: oldSession, records: [] }))
  if (oldSession !== null && !candidate)
    throw new Error('이전 집중 데이터를 읽을 수 없어요. 원본 백업은 유지했어요.')
  const legacy = json(localStorage.getItem('currentTask'))
  const current =
    sessionRaw !== null
      ? (candidate?.current ?? null)
      : sessionFromLegacyTask(
          typeof legacy === 'object' && legacy !== null ? (legacy as LegacyTask) : null,
          now,
          deviceId
        )
  const list = json(localStorage.getItem('taskList'))
  const used = new Set<string>()
  const records: FocusRecord[] = !Array.isArray(list)
    ? []
    : list.flatMap((value, index) => {
        if (
          !value ||
          typeof value.taskName !== 'string' ||
          !value.taskName.trim() ||
          typeof value.fullDuration !== 'number' ||
          !Number.isFinite(value.fullDuration) ||
          value.fullDuration < 0
        )
          return []
        const parsed = typeof value.date === 'string' ? Date.parse(value.date) : NaN
        const startedAt = Number.isFinite(parsed) && parsed >= 0 ? parsed : now
        const focusedMs = value.fullDuration * 1000
        const originalId =
          typeof value.id === 'string' && value.id.trim()
            ? value.id
            : `legacy-record-${startedAt}-${index}`
        const id = used.has(originalId) ? `${originalId}-legacy-${index}` : originalId
        used.add(id)
        return [
          {
            id,
            task: value.taskName.trim(),
            plannedMs: Math.max(1, focusedMs),
            focusedMs,
            completed: true,
            startedAt,
            finishedAt: startedAt + focusedMs,
            revision: 0,
            updatedAt: startedAt + focusedMs,
            updatedBy: deviceId
          }
        ]
      })
  const state = focusReducer({ current, records }, { type: 'tick', now })
  if (!parseFocusState(serializeFocusState(state)))
    throw new Error('이전 집중 데이터를 확인해야 해요. 원본 백업은 유지했어요.')
  localStorage.setItem(DESKTOP_FOCUS_KEY, serializeFocusState(state))
  localStorage.removeItem('currentTask')
  return state
}
