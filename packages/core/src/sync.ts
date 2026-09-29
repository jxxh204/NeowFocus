import type { FocusRecord } from './records'
import { finishFocus, type FocusSession } from './session'

/**
 * 두 기기의 상태를 합치는 규칙. 어느 쪽에서 계산해도 같은 결과가 나오도록
 * (local, remote) 순서에 의존하지 않는다.
 */

export type MergeResult = {
  current: FocusSession | null
  /** 다른 기기의 집중에 밀려 여기서 마친 집중. 화면에서 알려주고 기록에 남긴다. */
  displaced: FocusSession | null
}

const SYNC_DEVICE = 'sync'

export function mergeCurrent(
  a: FocusSession | null,
  b: FocusSession | null,
  now: number
): MergeResult {
  if (!a || !b) return { current: a ?? b, displaced: null }
  if (a.id === b.id) return { current: newerOf(a, b), displaced: null }

  const aActive = a.status !== 'finished'
  const bActive = b.status !== 'finished'
  if (aActive !== bActive) return { current: aActive ? a : b, displaced: null }
  if (!aActive) return { current: laterBy(a, b, (s) => s.finishedAt ?? 0), displaced: null }

  // 둘 다 진행 중: 오프라인에서 각자 시작한 경우. 나중에 시작한 집중을 잇는다.
  const keep = laterBy(a, b, (s) => s.startedAt)
  const other = keep === a ? b : a
  return { current: keep, displaced: finishFocus(other, now, SYNC_DEVICE) }
}

/** 같은 세션의 두 버전. 완료는 되돌리지 않고, 아니면 더 나중에 바꾼 쪽. */
function newerOf(a: FocusSession, b: FocusSession): FocusSession {
  if ((a.status === 'finished') !== (b.status === 'finished'))
    return a.status === 'finished' ? a : b
  return laterBy(a, b, (s) => s.updatedAt)
}

function laterBy(a: FocusSession, b: FocusSession, key: (s: FocusSession) => number) {
  const diff = key(a) - key(b)
  if (diff !== 0) return diff > 0 ? a : b
  return a.updatedBy >= b.updatedBy ? a : b
}

/** 기록은 세션 id가 곧 식별자라 합집합이면 된다. 먼저 있던 순서를 유지한다. */
export function mergeRecords(a: FocusRecord[], b: FocusRecord[]): FocusRecord[] {
  const seen = new Set(a.map((r) => r.id))
  return [...a, ...b.filter((r) => !seen.has(r.id))]
}
