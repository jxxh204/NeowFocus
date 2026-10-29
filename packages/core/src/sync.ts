import type { FocusRecord } from './records'
import type { FocusSession } from './session'

export type VersionStamp = { revision?: number; updatedAt?: number; updatedBy?: string }

/** No clock alone decides a causally newer edit. Tie breaks are stable on every device. */
export function compareVersion(a: VersionStamp, b: VersionStamp): number {
  return (a.revision ?? 0) - (b.revision ?? 0)
    || (a.updatedAt ?? 0) - (b.updatedAt ?? 0)
    || compareText(a.updatedBy ?? '', b.updatedBy ?? '')
}

export function compareText(a: string, b: string): number {
  return a === b ? 0 : a > b ? 1 : -1
}

export function newerSession(a: FocusSession, b: FocusSession): FocusSession {
  const revision = (a.revision ?? 0) - (b.revision ?? 0)
  if (revision) return revision > 0 ? a : b
  // A completion beats a concurrent edit at the same causal version, but never a later revision.
  if ((a.status === 'finished') !== (b.status === 'finished'))
    return a.status === 'finished' ? a : b
  const order = compareVersion(a, b) || compareText(JSON.stringify(a), JSON.stringify(b))
  return order >= 0 ? a : b
}

export type MergeResult = {
  current: FocusSession | null
  /** Kept for older consumers. A merge never silently ends another session. */
  displaced: FocusSession | null
  /** All active candidates, including current, when an explicit choice is needed. */
  conflicts: FocusSession[]
}

export function mergeCurrent(a: FocusSession | null, b: FocusSession | null, _now: number): MergeResult {
  if (!a || !b) return { current: a ?? b, displaced: null, conflicts: [] }
  if (a.id === b.id) return { current: newerSession(a, b), displaced: null, conflicts: [] }
  const aActive = a.status !== 'finished'
  const bActive = b.status !== 'finished'
  if (aActive && bActive) {
    return { current: a, displaced: null, conflicts: [a, b].sort((x, y) => compareText(x.id, y.id)) }
  }
  if (aActive !== bActive) return { current: aActive ? a : b, displaced: null, conflicts: [] }
  const order = (a.finishedAt ?? 0) - (b.finishedAt ?? 0) || compareText(a.id, b.id)
  return { current: order >= 0 ? a : b, displaced: null, conflicts: [] }
}

/** Deterministic union also removes duplicates within either input, independent of delivery order. */
export function mergeRecords(a: FocusRecord[], b: FocusRecord[]): FocusRecord[] {
  const records = new Map<string, FocusRecord>()
  for (const record of [...a, ...b]) {
    const previous = records.get(record.id)
    const stamp = (r: FocusRecord): VersionStamp => ({ ...r, updatedAt: r.updatedAt ?? r.finishedAt })
    const order = previous && (compareVersion(stamp(record), stamp(previous))
      || compareText(JSON.stringify(record), JSON.stringify(previous)))
    if (!previous || (order ?? 0) > 0) records.set(record.id, record)
  }
  return [...records.values()].sort((x, y) => x.finishedAt - y.finishedAt || compareText(x.id, y.id))
}

export function mergeByVersion<T extends VersionStamp>(a: T[], b: T[], key: (value: T) => string): T[] {
  const values = new Map<string, T>()
  for (const value of [...a, ...b]) {
    const id = key(value)
    const previous = values.get(id)
    if (!previous || (compareVersion(value, previous)
      || compareText(JSON.stringify(value), JSON.stringify(previous))) > 0) values.set(id, value)
  }
  return [...values.values()].sort((x, y) => compareText(key(x), key(y)))
}
