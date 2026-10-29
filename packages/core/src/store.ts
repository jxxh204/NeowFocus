import { toRecord, type FocusRecord } from './records'
import { compareText, compareVersion, mergeByVersion, mergeRecords, newerSession } from './sync'
import { finishFocus, pauseFocus, resumeFocus, settleFocus, startFocus, type FocusSession } from './session'
import type { DailySuggestionDecision } from './firstSuggestion'
import { nativeCommandResult, type NativeFocusCommand } from './nativeCommands'

/** Persist the explicit choice so delayed/offline snapshots cannot reintroduce the rejected session. */
export type ConflictResolution = {
  id: string
  selectedId: string
  sessions: FocusSession[]
  revision: number
  updatedAt: number
  updatedBy: string
}

/** A restore is a newer mutation, not removal of a tombstone (which would resurrect deleted data). */
export type RecordChange = {
  id: string
  deleted: boolean
  record: FocusRecord
  revision: number
  updatedAt: number
  updatedBy: string
}

export type FocusState = {
  current: FocusSession | null
  records: FocusRecord[]
  /** Legacy migration field; never newly populated. */
  displaced?: FocusSession | null
  /** All active sessions needing a choice, including current. */
  conflicts?: FocusSession[]
  resolutions?: ConflictResolution[]
  recordChanges?: RecordChange[]
  firstSuggestions?: DailySuggestionDecision[]
  dismissedSessionIds?: string[]
  nativeCommands?: NativeFocusCommand[]
}

export type FocusAction =
  | { type: 'start'; id: string; task: string; plannedMs: number; now: number; deviceId: string }
  | { type: 'pause'; now: number; deviceId: string }
  | { type: 'resume'; now: number; deviceId: string }
  | { type: 'finish'; now: number; deviceId: string }
  | { type: 'tick'; now: number }
  | { type: 'dismiss' }
  | ({ type: 'sync'; now: number } & FocusState)
  | { type: 'resolveConflict'; sessionId: string; now: number; deviceId: string }
  | { type: 'deleteRecord' | 'undoDeleteRecord'; id: string; now: number; deviceId: string }
  | { type: 'decideFirstSuggestion'; day: string; decision: 'selected' | 'skipped'; now: number; deviceId: string }
  | { type: 'ackDisplaced' }

export const EMPTY_STATE: FocusState = { current: null, records: [] }
export function isActive(session: FocusSession | null): session is FocusSession & { status: 'running' | 'paused' } {
  return session !== null && session.status !== 'finished'
}

export function focusReducer(state: FocusState, action: FocusAction): FocusState {
  const { current } = state
  switch (action.type) {
    case 'start':
      if (isActive(current) || state.conflicts?.length) return state
      return {
        ...state, current: startFocus(action),
        ...(current?.status === 'finished' ? {
          dismissedSessionIds: [...new Set([...(state.dismissedSessionIds ?? []), current.id])].sort(compareText)
        } : {})
      }
    case 'dismiss':
      return current?.status === 'finished' ? {
        ...state, current: null,
        dismissedSessionIds: [...new Set([...(state.dismissedSessionIds ?? []), current.id])].sort(compareText)
      } : state
    case 'ackDisplaced':
      return state.displaced ? { ...state, displaced: null } : state
    case 'sync':
      return mergeFocusStates(state, action, action.now)
    case 'resolveConflict':
      return resolveConflict(state, action.sessionId, action.now, action.deviceId)
    case 'deleteRecord':
    case 'undoDeleteRecord': {
      const prior = state.recordChanges?.find((item) => item.id === action.id)
      const record = state.records.find((item) => item.id === action.id) ?? prior?.record
      if (!record || (action.type === 'undoDeleteRecord' && !prior?.deleted)) return state
      const change: RecordChange = {
        id: action.id, deleted: action.type === 'deleteRecord', record,
        revision: (prior?.revision ?? 0) + 1, updatedAt: action.now, updatedBy: action.deviceId
      }
      return mergeFocusStates(state, {
        current: null, records: [], recordChanges: [change]
      }, action.now)
    }
    case 'decideFirstSuggestion': {
      const prior = state.firstSuggestions?.find((item) => item.day === action.day)
      const decision: DailySuggestionDecision = {
        day: action.day, decision: action.decision,
        revision: (prior?.revision ?? 0) + 1, updatedAt: action.now, updatedBy: action.deviceId
      }
      return { ...state, firstSuggestions: mergeByVersion(state.firstSuggestions ?? [], [decision], (item) => item.day) }
    }
  }
  if (!current || state.conflicts?.length) return state
  let next: FocusSession
  switch (action.type) {
    case 'pause': next = pauseFocus(current, action.now, action.deviceId); break
    case 'resume': next = resumeFocus(current, action.now, action.deviceId); break
    case 'finish': next = finishFocus(current, action.now, action.deviceId); break
    case 'tick': next = settleFocus(current, action.now); break
  }
  if (next === current) return state
  const record = toRecord(next)
  const records = applyRecordChanges(mergeRecords(state.records, record ? [record] : []), state.recordChanges ?? [])
  return { ...state, current: next, records }
}

export function mergeFocusStates(local: FocusState, remote: FocusState, now: number): FocusState {
  const nativeCommands = mergeByVersion(local.nativeCommands ?? [], remote.nativeCommands ?? [], (item) => item.id)
  const resolutions = mergeByVersion(local.resolutions ?? [], remote.resolutions ?? [], (item) => item.id)
  const recordChanges = mergeByVersion(local.recordChanges ?? [], remote.recordChanges ?? [], (item) => item.id)
  const firstSuggestions = mergeByVersion(local.firstSuggestions ?? [], remote.firstSuggestions ?? [], (item) => item.day)
  const dismissedSessionIds = [...new Set([...(local.dismissedSessionIds ?? []), ...(remote.dismissedSessionIds ?? [])])].sort(compareText)
  const sessions = new Map<string, FocusSession>()
  const resolutionFor = new Map<string, ConflictResolution>()
  for (const resolution of resolutions) {
    for (const session of resolution.sessions) {
      const previous = resolutionFor.get(session.id)
      if (!previous || (compareVersion(resolution, previous) || compareText(resolution.id, previous.id)) > 0)
        resolutionFor.set(session.id, resolution)
    }
  }
  const candidates = [local.current, remote.current, ...(local.conflicts ?? []), ...(remote.conflicts ?? []),
    ...resolutions.flatMap((item) => item.sessions),
    ...nativeCommands.flatMap((item) => item.baseSession ? [item.baseSession] : [])].filter((item): item is FocusSession => item !== null)
  for (const candidate of candidates) {
    const decision = resolutionFor.get(candidate.id)
    const resolved = decision?.sessions.find((item) => item.id === candidate.id)
    // A losing resolution must not undo the winning choice, including concurrent choices on two devices.
    const session = resolved && (decision?.selectedId !== candidate.id || candidate.finishReason === 'conflict')
      ? resolved : candidate
    const previous = sessions.get(session.id)
    sessions.set(session.id, previous ? newerSession(previous, session) : session)
  }
  // Widget intents are replayed before natural expiry. Each has a causal base so two
  // devices receiving concurrent pause/resume commands in a different order converge.
  const orderedCommands = [...nativeCommands].sort((a, b) => a.revision - b.revision
    || a.issuedAt - b.issuedAt || compareText(a.deviceId, b.deviceId) || compareText(a.id, b.id))
  for (const command of orderedCommands) {
    if (dismissedSessionIds.includes(command.sessionId)) continue
    const decision = resolutionFor.get(command.sessionId)
    if (decision && decision.selectedId !== command.sessionId) continue
    const previous = sessions.get(command.sessionId)
    const next = nativeCommandResult(command, previous)
    if (next) sessions.set(command.sessionId, previous ? newerSession(previous, next) : next)
  }
  // Resolutions retain their original snapshots. A finished record (including a deletion backup)
  // is also causal evidence, so dismissal cannot accidentally resurrect an old selected snapshot.
  const knownRecords = mergeRecords(mergeRecords(local.records, remote.records), recordChanges.map((item) => item.record))
  for (const record of knownRecords) {
    const candidate = sessions.get(record.id)
    if (!candidate) continue
    const decision = resolutionFor.get(record.id)
    if (record.finishReason === 'conflict' && decision?.selectedId === record.id) continue
    const finished: FocusSession = {
      ...candidate, task: record.task, plannedMs: record.plannedMs, startedAt: record.startedAt,
      status: 'finished', endsAt: null, remainingMs: 0, focusedMs: record.focusedMs,
      completed: record.completed, finishedAt: record.finishedAt,
      revision: record.revision, updatedAt: record.updatedAt ?? record.finishedAt,
      updatedBy: record.updatedBy ?? candidate.updatedBy, finishReason: record.finishReason
    }
    sessions.set(record.id, newerSession(candidate, finished))
  }
  // Dismissal is terminal evidence even for sub-minute sessions which intentionally have no record.
  for (const id of dismissedSessionIds) {
    if (sessions.get(id)?.status !== 'finished') sessions.delete(id)
  }
  // Resolve selected snapshots against later real edits, then settle only sessions without a live conflict.
  let active = [...sessions.values()].filter((item) => item.status !== 'finished').sort((a, b) => compareText(a.id, b.id))
  if (active.length < 2) {
    for (const session of sessions.values()) sessions.set(session.id, settleFocus(session, now))
    active = [...sessions.values()].filter((item) => item.status !== 'finished').sort((a, b) => compareText(a.id, b.id))
  }
  const conflicts = active.length > 1 ? active : []
  const activeIds = new Set(active.map((item) => item.id))
  let records = mergeRecords(local.records, remote.records)
  records = mergeRecords(records, [...sessions.values()].flatMap((session) => {
    const record = toRecord(session, session.finishReason === 'conflict')
    return record ? [record] : []
  })).filter((record) => !activeIds.has(record.id))
  records = applyRecordChanges(records, recordChanges)
  const finished = [...sessions.values()].filter((item) => item.status === 'finished' && item.finishReason !== 'conflict' && !dismissedSessionIds.includes(item.id))
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0) || compareText(a.id, b.id))
  const current = active[0] ?? finished[0] ?? null
  return {
    current, records, conflicts, resolutions, recordChanges, firstSuggestions, dismissedSessionIds, nativeCommands,
    ...(local.displaced ? { displaced: local.displaced } : {})
  }
}

function applyRecordChanges(records: FocusRecord[], changes: RecordChange[]): FocusRecord[] {
  const mutations = new Map(changes.map((item) => [item.id, item]))
  const restored = changes.filter((item) => !item.deleted).map((item) => item.record)
  return mergeRecords(records, restored).filter((record) => !mutations.get(record.id)?.deleted)
}

function resolveConflict(state: FocusState, sessionId: string, now: number, deviceId: string): FocusState {
  const candidates = state.conflicts ?? []
  if (candidates.length < 2 || !candidates.some((item) => item.id === sessionId)) return state
  const ids = candidates.map((item) => item.id).sort(compareText)
  const id = JSON.stringify(ids)
  const prior = state.resolutions?.find((item) => item.id === id)
  const revision = Math.max(prior?.revision ?? 0, ...candidates.map((item) => item.revision ?? 0)) + 1
  const sessions = candidates.map((session): FocusSession => {
    const selected = session.id === sessionId
    const result = selected ? session : finishFocus(session, Math.max(now, session.startedAt), deviceId)
    return {
      ...result, revision, updatedAt: now, updatedBy: deviceId,
      ...(!selected ? { finishReason: 'conflict' as const } : {})
    }
  })
  const resolution: ConflictResolution = { id, selectedId: sessionId, sessions, revision, updatedAt: now, updatedBy: deviceId }
  return mergeFocusStates({ ...state, resolutions: (state.resolutions ?? []).filter((item) => item.id !== id) }, {
    current: sessions.find((item) => item.id === sessionId) ?? null, records: [], resolutions: [resolution]
  }, now)
}
