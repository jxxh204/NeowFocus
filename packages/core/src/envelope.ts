import type { NativeFocusCommand } from './nativeCommands'
import type { DailySuggestionDecision } from './firstSuggestion'
import type { FocusRecord } from './records'
import type { FocusSession } from './session'
import type { ConflictResolution, FocusState, RecordChange } from './store'

export const SYNC_SCHEMA_VERSION = 1 as const
export type SyncEnvelope = { schemaVersion: typeof SYNC_SCHEMA_VERSION; state: FocusState }
export function createSyncEnvelope(state: FocusState): SyncEnvelope {
  return { schemaVersion: SYNC_SCHEMA_VERSION, state }
}
export function serializeFocusState(state: FocusState): string {
  return JSON.stringify(createSyncEnvelope(state))
}

/** Unrecognized versions are never treated as empty state and written back over cloud data. */
export function parseSyncEnvelope(json: string | unknown): FocusState | null {
  const value = decode(json)
  if (!object(value) || value.schemaVersion !== SYNC_SCHEMA_VERSION) return null
  return validateFocusState(value.state)
}

/** Restores older local MVP snapshots as well as the versioned format. */
export function parseFocusState(json: string): FocusState | null {
  const value = decode(json)
  if (object(value) && 'schemaVersion' in value) return parseSyncEnvelope(value)
  return validateFocusState(value)
}

export function validateFocusState(value: unknown): FocusState | null {
  if (!object(value) || !(value.current === null || validSession(value.current)) || !arrayOf(value.records, validRecord)) return null
  if (value.displaced !== undefined && value.displaced !== null && !validSession(value.displaced)) return null
  if (!optionalArray(value.conflicts, validSession) || !optionalArray(value.resolutions, validResolution)
    || !optionalArray(value.recordChanges, validRecordChange) || !optionalArray(value.firstSuggestions, validSuggestion)
    || !optionalArray(value.dismissedSessionIds, text) || !optionalArray(value.nativeCommands, validNativeCommand)) return null
  // Explicit field copy prevents unrelated persisted preferences from entering the sync payload.
  return {
    current: value.current as FocusSession | null,
    records: value.records as FocusRecord[],
    ...(value.displaced !== undefined ? { displaced: value.displaced as FocusSession | null } : {}),
    ...(value.conflicts !== undefined ? { conflicts: value.conflicts as FocusSession[] } : {}),
    ...(value.resolutions !== undefined ? { resolutions: value.resolutions as ConflictResolution[] } : {}),
    ...(value.recordChanges !== undefined ? { recordChanges: value.recordChanges as RecordChange[] } : {}),
    ...(value.firstSuggestions !== undefined ? { firstSuggestions: value.firstSuggestions as DailySuggestionDecision[] } : {}),
    ...(value.nativeCommands !== undefined ? { nativeCommands: value.nativeCommands as NativeFocusCommand[] } : {}),
    ...(value.dismissedSessionIds !== undefined ? { dismissedSessionIds: value.dismissedSessionIds as string[] } : {})
  }
}

function decode(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { return null }
}
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 }
function time(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 0 }
function revision(value: unknown): boolean { return time(value) && Number.isSafeInteger(value) }
function arrayOf(value: unknown, validate: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.every(validate)
}
function optionalArray(value: unknown, validate: (item: unknown) => boolean): boolean {
  return value === undefined || arrayOf(value, validate)
}
function validStamp(value: Record<string, unknown>, required = false): boolean {
  return (!required && value.revision === undefined || revision(value.revision))
    && (!required && value.updatedAt === undefined || time(value.updatedAt))
    && (!required && value.updatedBy === undefined || text(value.updatedBy))
}
function validReason(value: unknown): boolean {
  return value === undefined || value === 'manual' || value === 'completed' || value === 'conflict'
}
function validSession(value: unknown): boolean {
  if (!object(value) || !text(value.id) || !text(value.task) || !text(value.updatedBy)
    || !time(value.plannedMs) || value.plannedMs <= 0 || !time(value.startedAt)
    || !time(value.updatedAt) || !time(value.remainingMs) || value.remainingMs > value.plannedMs
    || !time(value.focusedMs) || value.focusedMs > value.plannedMs || typeof value.completed !== 'boolean'
    || !validStamp(value) || !validReason(value.finishReason)
    || value.startedBy !== undefined && !text(value.startedBy)) return false
  if (value.status === 'running') return time(value.endsAt) && value.endsAt >= value.startedAt
    && value.finishedAt === null && !value.completed && value.focusedMs === 0
  if (value.status === 'paused') return value.endsAt === null && value.finishedAt === null
    && value.remainingMs > 0 && !value.completed && value.focusedMs === 0
  if (value.status === 'finished') return value.endsAt === null && time(value.finishedAt)
    && value.finishedAt >= value.startedAt && value.remainingMs === 0
    && (!value.completed || value.focusedMs === value.plannedMs)
  return false
}
function validRecord(value: unknown): boolean {
  return object(value) && text(value.id) && text(value.task) && time(value.plannedMs) && value.plannedMs > 0
    && time(value.focusedMs) && value.focusedMs <= value.plannedMs && typeof value.completed === 'boolean'
    && time(value.startedAt) && time(value.finishedAt) && value.finishedAt >= value.startedAt
    && validStamp(value) && validReason(value.finishReason)
}
function validResolution(value: unknown): boolean {
  if (!object(value) || !text(value.id) || !text(value.selectedId) || !validStamp(value, true)
    || !arrayOf(value.sessions, validSession)) return false
  const sessions = value.sessions as FocusSession[]
  const ids = sessions.map((session) => session.id).sort()
  return sessions.length > 1 && new Set(ids).size === ids.length && value.id === JSON.stringify(ids)
    && sessions.some((session) => session.id === value.selectedId)
    && sessions.every((session) => session.id === value.selectedId || session.status === 'finished' && session.finishReason === 'conflict')
}
function validRecordChange(value: unknown): boolean {
  return object(value) && text(value.id) && typeof value.deleted === 'boolean' && validRecord(value.record)
    && (value.record as FocusRecord).id === value.id && validStamp(value, true)
}
function validSuggestion(value: unknown): boolean {
  if (!object(value) || typeof value.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.day)
    || !(value.decision === 'selected' || value.decision === 'skipped') || !validStamp(value, true)) return false
  const date = new Date(`${value.day}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.day
}

function validNativeCommand(value: unknown): boolean {
  if (!object(value) || !text(value.id) || !text(value.sessionId) || !text(value.deviceId)
    || !(value.action === 'pause' || value.action === 'resume')
    || !time(value.issuedAt) || !revision(value.revision) || (value.revision as number) < 1) return false
  if (value.baseSession === undefined) return true
  if (!validSession(value.baseSession)) return false
  const base = value.baseSession as FocusSession
  return base.id === value.sessionId && (base.revision ?? 0) + 1 === value.revision
    && value.issuedAt >= base.startedAt
    && (value.action === 'pause' && base.status === 'running' || value.action === 'resume' && base.status === 'paused')
}
