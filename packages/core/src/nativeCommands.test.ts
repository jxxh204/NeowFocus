import { describe, expect, it } from 'vitest'
import { mergeFocusStates, focusReducer, type FocusState } from './store'
import { pauseFocus, resumeFocus, settleFocus, startFocus, type FocusSession } from './session'
import { serializeFocusState, parseSyncEnvelope } from './envelope'
import type { NativeFocusCommand } from './nativeCommands'

const T = Date.UTC(2026, 9, 13, 12)
const M = 60_000
const start = (id = 's1') => startFocus({ id, task: '집중', now: T, deviceId: 'phone', plannedMs: 25 * M })
const state = (current: FocusSession | null, nativeCommands: NativeFocusCommand[] = []): FocusState => ({ current, records: [], nativeCommands })
const command = (base: FocusSession, action: 'pause' | 'resume', issuedAt: number, deviceId = 'phone'): NativeFocusCommand => ({
  id: `${deviceId}-${action}-${issuedAt}`, sessionId: base.id, action, issuedAt, deviceId,
  revision: (base.revision ?? 0) + 1, baseSession: base
})

describe('durable native widget commands', () => {
  it('replays an offline pause before settling an expired JS deadline', () => {
    const base = start()
    const pause = command(base, 'pause', T + 2 * M)
    const result = mergeFocusStates(state(base), state(base, [pause]), T + 30 * M)
    expect(result.current?.status).toBe('paused')
    expect(result.current?.remainingMs).toBe(23 * M)
    expect(result.records).toEqual([])
    expect(result.nativeCommands).toEqual([pause])
  })

  it('replaying the same native action and restoring metadata is idempotent', () => {
    const base = start()
    const pause = command(base, 'pause', T + M)
    const initial = mergeFocusStates(state(base), state(base, [pause, pause]), T + 2 * M)
    const restored = parseSyncEnvelope(serializeFocusState(initial))!
    const result = mergeFocusStates(restored, state(base, [pause]), T + 3 * M)
    expect(result.current).toEqual(initial.current)
    expect(result.nativeCommands).toHaveLength(1)
    expect(result.records).toEqual([])
  })

  it('different same-revision pauses converge regardless of delivery order', () => {
    const base = start()
    const a = command(base, 'pause', T + M, 'phone-a')
    const b = command(base, 'pause', T + 2 * M, 'phone-b')
    const firstA = mergeFocusStates(state(base), state(base, [a]), T + 3 * M)
    const firstB = mergeFocusStates(state(base), state(base, [b]), T + 3 * M)
    const aThenB = mergeFocusStates(firstA, state(base, [b]), T + 3 * M)
    const bThenA = mergeFocusStates(firstB, state(base, [a]), T + 3 * M)
    expect(aThenB.current).toEqual(bThenA.current)
    expect(aThenB.current?.remainingMs).toBe(23 * M)
    expect(aThenB.nativeCommands).toEqual(bThenA.nativeCommands)
  })

  it('resume with a causal base supersedes an old natural completion', () => {
    const base = start()
    const paused = pauseFocus(base, T + M, 'phone')
    const resume = command(paused, 'resume', T + 24 * M)
    const staleDone = settleFocus(base, T + 26 * M)
    const result = mergeFocusStates(state(staleDone), state(null, [resume]), T + 26 * M)
    expect(result.current?.status).toBe('running')
    expect(result.current?.endsAt).toBe(T + 48 * M)
    expect(result.records).toEqual([])
  })

  it('does not replace a newer session version with an old command', () => {
    const base = start()
    const paused = pauseFocus(base, T + M, 'phone')
    const resumed = resumeFocus(paused, T + 2 * M, 'mac')
    const result = mergeFocusStates(state(resumed), state(base, [command(base, 'pause', T + M)]), T + 3 * M)
    expect(result.current).toEqual(resumed)
  })

  it('holds legacy revision gaps and replays them after the missing predecessor arrives', () => {
    const base = start()
    const pause = command(base, 'pause', T + M)
    const paused = pauseFocus(base, T + M, 'phone')
    const resume = command(paused, 'resume', T + 2 * M)
    delete pause.baseSession
    delete resume.baseSession
    const gap = mergeFocusStates(state(base), state(null, [resume]), T + 3 * M)
    expect(gap.current).toEqual(base)
    expect(gap.nativeCommands).toEqual([resume])
    const result = mergeFocusStates(gap, state(null, [pause]), T + 3 * M)
    expect(result.current?.status).toBe('running')
    expect(result.current?.revision).toBe(3)
    expect(result.current?.endsAt).toBe(T + 26 * M)
  })

  it('updates conflict candidates too, without silently choosing one', () => {
    const a = start('a')
    const b = start('b')
    const conflict = mergeFocusStates(state(a), state(b), T + M)
    const result = mergeFocusStates(conflict, state(null, [command(b, 'pause', T + 2 * M)]), T + 3 * M)
    expect(result.conflicts?.map((item) => [item.id, item.status])).toEqual([['a', 'running'], ['b', 'paused']])
    expect(result.records).toEqual([])
  })

  it('never revives a discarded conflict or a dismissed completion', () => {
    const a = start('a')
    const b = start('b')
    const conflict = mergeFocusStates(state(a), state(b), T + M)
    const choice = focusReducer(conflict, { type: 'resolveConflict', sessionId: 'a', now: T + M, deviceId: 'mac' })
    const result = mergeFocusStates(choice, state(null, [command(b, 'pause', T + 2 * M)]), T + 3 * M)
    expect(result.current?.id).toBe('a')
    expect(result.conflicts).toEqual([])
    const finished = focusReducer(result, { type: 'finish', now: T + 4 * M, deviceId: 'mac' })
    const dismissed = focusReducer(finished, { type: 'dismiss' })
    expect(mergeFocusStates(dismissed, state(null, [command(a, 'pause', T + 2 * M)]), T + 5 * M).current).toBeNull()
  })

  it('rejects an unrelated causal base or malformed native command', () => {
    const base = start()
    const pause = command(base, 'pause', T + M)
    expect(parseSyncEnvelope(serializeFocusState(state(base, [{ ...pause, sessionId: 'other' }])))).toBeNull()
    expect(parseSyncEnvelope(serializeFocusState(state(base, [{ ...pause, revision: 99 }])))).toBeNull()
    expect(parseSyncEnvelope(serializeFocusState(state(base, [{ ...pause, deviceId: '' }])))).toBeNull()
  })
})

it('directly restarting after a brief finish cannot revive its older widget command snapshot', () => {
  const base = start()
  const paused = mergeFocusStates(state(base), state(base, [command(base, 'pause', T + 10_000)]), T + 15_000)
  const finished = focusReducer(paused, { type: 'finish', now: T + 20_000, deviceId: 'phone' })
  expect(finished.records).toMatchObject([{ id: 's1', focusedMs: 10_000, finishReason: 'manual' }])
  const restarted = focusReducer(finished, { type: 'start', id: 'next', task: '다음 집중', plannedMs: 25 * M, now: T + 30_000, deviceId: 'phone' })
  const replay = mergeFocusStates(restarted, paused, T + 40_000)
  expect(replay.current?.id).toBe('next')
  expect(replay.conflicts).toEqual([])
  expect(replay.dismissedSessionIds).toContain(base.id)
})
