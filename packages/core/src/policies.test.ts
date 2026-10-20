import { describe, expect, it } from 'vitest'
import { EMPTY_STATE, focusReducer, mergeFocusStates, type FocusState } from './store'
import { finishFocus, pauseFocus, resumeFocus, settleFocus, startFocus } from './session'
import { toRecord } from './records'
import { canSuggestFirstFocus } from './firstSuggestion'
import { parseFocusState, parseSyncEnvelope, serializeFocusState, createSyncEnvelope } from './envelope'
import { mergeRecords } from './sync'

const MIN = 60_000
const NOW = new Date(2026, 9, 13, 9).getTime()
const session = (id = 'a', device = 'mac', at = NOW) => startFocus({
  id, task: '글쓰기', plannedMs: 25 * MIN, now: at, deviceId: device
})
const state = (current = session()): FocusState => ({ current, records: [] })
const sync = (a: FocusState, b: FocusState, now = NOW + 5 * MIN) => focusReducer(a, { ...b, type: 'sync', now })
const completed = (): FocusState => focusReducer(state(), { type: 'tick', now: NOW + 25 * MIN })

it('causal resume wins over a stale natural completion, including its stale record', () => {
  const base = session()
  const resumed = resumeFocus(pauseFocus(base, NOW + MIN, 'phone'), NOW + 10 * MIN, 'phone')
  const finished = settleFocus(base, NOW + 25 * MIN)
  const result = sync(state(resumed), { current: finished, records: [toRecord(finished)!] }, NOW + 26 * MIN)
  expect(result.current?.status).toBe('running')
  expect(result.current?.endsAt).toBe(NOW + 34 * MIN)
  expect(result.records).toEqual([])
})

it('stale offline pause does not reopen an elapsed session', () => {
  const base = session()
  const paused = pauseFocus(base, NOW + MIN, 'phone')
  const done = settleFocus(base, NOW + 25 * MIN)
  const result = sync(state(paused), state(done), NOW + 26 * MIN)
  expect(result.current?.status).toBe('finished')
  expect(result.records).toHaveLength(1)
})

it('later causal edits survive clocks moving backwards', () => {
  const paused = pauseFocus(session(), NOW + 5 * MIN, 'phone')
  const resumed = resumeFocus(paused, NOW + 3 * MIN, 'mac')
  expect(sync(state(paused), state(resumed), NOW + 4 * MIN).current).toEqual(resumed)
})

describe('conflict choice', () => {
  it('retains three offline sessions and refuses ordinary edits before a choice', () => {
    const a = state(session('a'))
    const b = state(session('b', 'phone'))
    const c = state(session('c', 'tablet'))
    const merged = sync(sync(a, b), c)
    expect(merged.conflicts?.map((item) => item.id)).toEqual(['a', 'b', 'c'])
    expect(merged.records).toEqual([])
    expect(focusReducer(merged, { type: 'pause', now: NOW + 5 * MIN, deviceId: 'mac' })).toBe(merged)
    expect(sync(c, sync(b, a)).conflicts).toEqual(merged.conflicts)
  })

  it('explicit selection preserves even a very brief rejected focus and ignores stale replay', () => {
    const a = state(session('a'))
    const b = state(session('b', 'phone', NOW + 10_000))
    const merged = sync(a, b, NOW + 20_000)
    const chosen = focusReducer(merged, { type: 'resolveConflict', sessionId: 'b', now: NOW + 30_000, deviceId: 'phone' })
    expect(chosen.current?.id).toBe('b')
    expect(chosen.conflicts).toEqual([])
    expect(chosen.records).toMatchObject([{ id: 'a', finishReason: 'conflict', focusedMs: 30_000 }])
    const replay = sync(chosen, a, NOW + 40_000)
    expect(replay.current?.id).toBe('b')
    expect(replay.conflicts).toEqual([])
    expect(replay.records).toEqual(chosen.records)
  })

  it('simultaneous opposite choices converge without discarding either session', () => {
    const a = state(session('a'))
    const b = state(session('b', 'phone'))
    const chosenA = focusReducer(sync(a, b), { type: 'resolveConflict', sessionId: 'a', now: NOW + 5 * MIN, deviceId: 'mac' })
    const chosenB = focusReducer(sync(b, a), { type: 'resolveConflict', sessionId: 'b', now: NOW + 5 * MIN, deviceId: 'phone' })
    const fromA = sync(chosenA, chosenB)
    const fromB = sync(chosenB, chosenA)
    expect(fromA.current).toEqual(fromB.current)
    expect(fromA.current?.id).toBe('b')
    expect(fromA.records).toEqual(fromB.records)
    expect(fromA.records.map((item) => item.id)).toEqual(['a'])
  })
})

describe('records and tombstones', () => {
  it('deduplicates within a batch and converges across delivery orders', () => {
    const a = toRecord(finishFocus(session(), NOW + 5 * MIN, 'mac'))!
    const b = { ...a, revision: 5, focusedMs: 6 * MIN }
    expect(mergeRecords([a, a], [b, b])).toEqual([b])
    expect(mergeRecords([a], [b])).toEqual(mergeRecords([b], [a]))
  })

  it('completion, repeated sync and reloaded state only create one record', () => {
    const done = completed()
    const result = sync(sync(done, done), parseFocusState(serializeFocusState(done))!, NOW + 30 * MIN)
    expect(result.records).toHaveLength(1)
  })

  it('deletion survives offline replay; undo propagates as a newer restore', () => {
    const done = completed()
    const deleted = focusReducer(done, { type: 'deleteRecord', id: 'a', now: NOW + 30 * MIN, deviceId: 'phone' })
    expect(deleted.records).toEqual([])
    expect(sync(deleted, done, NOW + 31 * MIN).records).toEqual([])
    expect(sync(done, deleted, NOW + 31 * MIN).records).toEqual([])
    const undone = focusReducer(deleted, { type: 'undoDeleteRecord', id: 'a', now: NOW + 32 * MIN, deviceId: 'phone' })
    expect(undone.records).toHaveLength(1)
    expect(sync(deleted, undone, NOW + 33 * MIN).records).toEqual(undone.records)
    const deletedAgain = focusReducer(undone, { type: 'deleteRecord', id: 'a', now: NOW + 34 * MIN, deviceId: 'mac' })
    expect(sync(deletedAgain, undone, NOW + 35 * MIN).records).toEqual([])
  })

  it('dismissed completion does not keep reappearing after sync', () => {
    const done = completed()
    const dismissed = focusReducer(done, { type: 'dismiss' })
    expect(sync(dismissed, done, NOW + 30 * MIN).current).toBeNull()
    expect(sync(done, dismissed, NOW + 30 * MIN).current).toBeNull()
  })
})

describe('first suggestion', () => {
  it('waits for the first sync and offers no suggestion during active work', () => {
    expect(canSuggestFirstFocus(EMPTY_STATE, { now: NOW })).toBe(true)
    expect(canSuggestFirstFocus(EMPTY_STATE, { now: NOW, syncEnabled: true })).toBe(false)
    expect(canSuggestFirstFocus(EMPTY_STATE, { now: NOW, syncEnabled: true, syncReady: true })).toBe(true)
    expect(canSuggestFirstFocus(state(), { now: NOW })).toBe(false)
    expect(canSuggestFirstFocus(EMPTY_STATE, { now: NOW, task: '직접 쓴 일' })).toBe(false)
  })
  it('shares skipped decisions and does not reoffer after record deletion', () => {
    const skipped = focusReducer(EMPTY_STATE, { type: 'decideFirstSuggestion', day: '2026-10-13', decision: 'skipped', now: NOW, deviceId: 'mac' })
    expect(canSuggestFirstFocus(sync(EMPTY_STATE, skipped), { now: NOW })).toBe(false)
    const deleted = focusReducer(completed(), { type: 'deleteRecord', id: 'a', now: NOW + 30 * MIN, deviceId: 'mac' })
    const dismissed = focusReducer(deleted, { type: 'dismiss' })
    expect(canSuggestFirstFocus(dismissed, { now: NOW + 31 * MIN })).toBe(false)
  })
})

describe('untrusted persistence', () => {
  it('roundtrips all metadata and accepts original MVP state', () => {
    const original = state()
    delete original.current!.revision
    delete original.current!.startedBy
    expect(parseFocusState(JSON.stringify(original))).toEqual(original)
    const conflict = sync(original, state(session('b', 'phone')))
    expect(parseSyncEnvelope(serializeFocusState(conflict))).toEqual(conflict)
    expect(parseSyncEnvelope(JSON.stringify(original))).toBeNull()
  })
  it.each([
    'not json', 'null', '{}', '{"schemaVersion":99,"state":{"current":null,"records":[]}}',
    JSON.stringify({ current: { ...session(), plannedMs: -1 }, records: [] }),
    JSON.stringify({ current: { ...session(), status: 'whatever' }, records: [] }),
    JSON.stringify({ current: { ...session(), revision: -1 }, records: [] }),
    JSON.stringify({ current: { ...session(), endsAt: null }, records: [] }),
    JSON.stringify({ current: null, records: [null] }),
    JSON.stringify({ current: null, records: [], recordChanges: [{ id: 'a', deleted: true }] }),
    JSON.stringify({ current: null, records: [], conflicts: 'a' })
  ])('rejects invalid restored payload: %s', (json) => {
    expect(parseFocusState(json)).toBeNull()
  })
  it('rejects nonfinite values from an in-memory transport envelope', () => {
    expect(parseSyncEnvelope(createSyncEnvelope(state({ ...session(), updatedAt: Infinity })))).toBeNull()
  })
})

it('a resolved session finished and dismissed later never resurrects from its resolution snapshot', () => {
  const conflict = sync(state(session('a')), state(session('b', 'phone')))
  const chosen = focusReducer(conflict, { type: 'resolveConflict', sessionId: 'b', now: NOW + 5 * MIN, deviceId: 'phone' })
  const finished = focusReducer(chosen, { type: 'finish', now: NOW + 10 * MIN, deviceId: 'phone' })
  const dismissed = focusReducer(finished, { type: 'dismiss' })
  const merged = mergeFocusStates(dismissed, chosen, NOW + 11 * MIN)
  expect(merged.current).toBeNull()
  expect(merged.conflicts).toEqual([])
  expect(merged.records.map((item) => item.id)).toEqual(['a', 'b'])
})

it('brief selected focus is saved once and stays dismissed after stale replay', () => {
  const conflict = sync(state(session('a')), state(session('b', 'phone')), NOW + 10_000)
  const chosen = focusReducer(conflict, { type: 'resolveConflict', sessionId: 'b', now: NOW + 15_000, deviceId: 'phone' })
  const finished = focusReducer(chosen, { type: 'finish', now: NOW + 20_000, deviceId: 'phone' })
  const dismissed = focusReducer(finished, { type: 'dismiss' })
  expect(dismissed.records.map((record) => record.id).sort()).toEqual(['a', 'b'])
  expect(mergeFocusStates(dismissed, chosen, NOW + 30_000).current).toBeNull()
})
