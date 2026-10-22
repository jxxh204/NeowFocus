import { describe, expect, it, vi } from 'vitest'
import { FocusReplicator, type CloudTransport, type SyncStatus } from './replicator'
import { EMPTY_STATE, focusReducer, type FocusState } from './store'
import { parseSyncEnvelope, serializeFocusState } from './envelope'
import { startFocus } from './session'

const NOW = Date.UTC(2026, 9, 13, 9)
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function harness(transport: CloudTransport, initial = EMPTY_STATE) {
  let state: FocusState = initial
  const statuses: Array<{ status: SyncStatus; message?: string }> = []
  const apply = vi.fn((next: FocusState) => { state = next })
  const worker = new FocusReplicator({ transport, getState: () => state, applyState: apply,
    now: () => NOW + 60_000, onStatus: (status, message) => { statuses.push({ status, message }) } })
  return { worker, apply, statuses, get: () => state, set: (next: FocusState) => { state = next } }
}
const active = (id: string): FocusState => ({ current: startFocus({ id, task: id, plannedMs: 300_000,
  now: NOW, deviceId: id }), records: [] })

describe('FocusReplicator', () => {
  it('restores the completed focus list from cloud on a fresh device', async () => {
    let completed = active('phone');
    completed = focusReducer(completed, { type: 'tick', now: NOW + 300_000 });
    completed = focusReducer(completed, { type: 'dismiss' });
    let json: string | null = null;
    const transport = { read: async () => ({ json, changeTag: json ? 'saved' : null }),
      write: async (payload: string) => { json = payload; return 'saved' } };
    await harness(transport, completed).worker.sync();
    const fresh = harness(transport);
    await fresh.worker.sync();
    expect(fresh.get().records).toEqual(completed.records);
    expect(fresh.get().records[0]).toMatchObject({ task: 'phone', focusedMs: 300_000 });
  })
  it('re-reads after compare-and-swap rejection and preserves concurrent offline work', async () => {
    const remote = active('phone')
    let json: string | null = null
    let tag: string | null = null
    const write = vi.fn(async (payload: string, expected: string | null) => {
      if (write.mock.calls.length === 1) {
        json = serializeFocusState(remote)
        tag = 'server-v1'
        throw new Error('serverRecordChanged')
      }
      expect(expected).toBe('server-v1')
      json = payload
      tag = 'server-v2'
      return tag
    })
    const read = vi.fn(async () => ({ json, changeTag: tag }))
    const app = harness({ read, write }, active('mac'))
    await app.worker.sync()
    expect(read).toHaveBeenCalledTimes(2)
    expect(write).toHaveBeenCalledTimes(2)
    expect(app.get().conflicts?.map((item) => item.id)).toEqual(['mac', 'phone'])
    expect(parseSyncEnvelope(json)?.conflicts).toEqual(app.get().conflicts)
    expect(app.statuses.at(-1)?.status).toBe('conflict')
  })

  it('does not overwrite cloud when the initial read is offline', async () => {
    const write = vi.fn(async (_json: string) => 'v1')
    const read = vi.fn(async () => { throw new Error('network unavailable') })
    const local = active('mac')
    const app = harness({ read, write }, local)
    await app.worker.sync()
    expect(write).not.toHaveBeenCalled()
    expect(app.apply).not.toHaveBeenCalled()
    expect(app.get()).toBe(local)
    expect(app.statuses.at(-1)).toEqual({ status: 'offline', message: 'network unavailable' })
  })

  it.each(['not JSON', '{"schemaVersion":2,"state":{"current":null,"records":[]}}'])('does not overwrite unreadable remote: %s', async (json) => {
    const write = vi.fn(async (_json: string) => 'v1')
    const app = harness({ read: async () => ({ json, changeTag: 'v0' }), write }, active('mac'))
    await app.worker.sync()
    expect(write).not.toHaveBeenCalled()
    expect(app.apply).not.toHaveBeenCalled()
    expect(app.statuses.at(-1)?.status).toBe('offline')
  })

  it('writes again when the user edits while a write is in flight', async () => {
    const firstWrite = deferred<string>()
    const enteredWrite = deferred<void>()
    let remote: string | null = null
    let tag: string | null = null
    const write = vi.fn(async (json: string) => {
      if (write.mock.calls.length === 1) {
        enteredWrite.resolve()
        await firstWrite.promise
      }
      remote = json
      tag = `v${write.mock.calls.length}`
      return tag
    })
    const app = harness({ read: async () => ({ json: remote, changeTag: tag }), write }, active('mac'))
    const pending = app.worker.sync()
    await enteredWrite.promise
    app.set(focusReducer(app.get(), { type: 'pause', now: NOW + 30_000, deviceId: 'mac' }))
    firstWrite.resolve('v1')
    await pending
    expect(write).toHaveBeenCalledTimes(2)
    expect(parseSyncEnvelope(remote)?.current?.status).toBe('paused')
    expect(app.get().current?.status).toBe('paused')
  })

  it('merges against the latest local state after a slow read', async () => {
    const firstRead = deferred<{ json: string | null; changeTag: string | null }>()
    const write = vi.fn(async (_json: string) => 'v1')
    const app = harness({ read: () => firstRead.promise, write }, active('mac'))
    const pending = app.worker.sync()
    app.set(focusReducer(app.get(), { type: 'pause', now: NOW + 30_000, deviceId: 'mac' }))
    firstRead.resolve({ json: serializeFocusState(active('mac')), changeTag: 'v0' })
    await pending
    expect(app.get().current?.status).toBe('paused')
    expect(parseSyncEnvelope(write.mock.calls[0]?.[0])?.current?.status).toBe('paused')
  })

  it('stopping during a read prevents late state apply, write and status delivery', async () => {
    const read = deferred<{ json: string | null; changeTag: string | null }>()
    const write = vi.fn(async (_json: string) => 'v1')
    const app = harness({ read: () => read.promise, write })
    const pending = app.worker.sync()
    app.worker.stop()
    const events = app.statuses.length
    read.resolve({ json: serializeFocusState(active('phone')), changeTag: 'v0' })
    await pending
    expect(app.apply).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
    expect(app.statuses).toHaveLength(events)
    await app.worker.sync()
    expect(app.apply).not.toHaveBeenCalled()
  })

  it('stopping during write sends no late UI status and starts no extra pass', async () => {
    const write = deferred<string>()
    const entered = deferred<void>()
    const read = vi.fn(async () => ({ json: null, changeTag: null }))
    const app = harness({ read, write: async () => { entered.resolve(); return write.promise } }, active('mac'))
    const pending = app.worker.sync()
    await entered.promise
    app.worker.stop()
    const events = app.statuses.length
    write.resolve('v1')
    await pending
    expect(app.statuses).toHaveLength(events)
    expect(read).toHaveBeenCalledTimes(1)
  })

  it('bounds repeated CAS conflicts to four attempts, then reports the failure', async () => {
    const read = vi.fn(async () => ({ json: null, changeTag: null }))
    const write = vi.fn(async () => { throw new Error('record changed') })
    const app = harness({ read, write }, active('mac'))
    await app.worker.sync()
    expect(read).toHaveBeenCalledTimes(4)
    expect(write).toHaveBeenCalledTimes(4)
    expect(app.statuses.at(-1)?.status).toBe('offline')
  })
})

it('healthy polling keeps synced status; only first connection and recovery report connecting', async () => {
  let offline = false
  let json: string | null = null
  const app = harness({
    read: async () => {
      if (offline) throw new Error('offline')
      return { json, changeTag: json ? 'v1' : null }
    },
    write: async (next) => { json = next; return 'v1' }
  })
  await app.worker.sync()
  expect(app.statuses.map((item) => item.status)).toEqual(['connecting', 'synced'])
  app.statuses.length = 0
  await app.worker.sync()
  expect(app.statuses.map((item) => item.status)).toEqual(['synced'])
  offline = true
  await app.worker.sync()
  expect(app.statuses.at(-1)?.status).toBe('offline')
  app.statuses.length = 0
  offline = false
  await app.worker.sync()
  expect(app.statuses.map((item) => item.status)).toEqual(['connecting', 'synced'])
})
