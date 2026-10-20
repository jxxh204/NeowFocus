import type { FocusState } from './store'
import { focusReducer } from './store'
import { parseSyncEnvelope, serializeFocusState } from './envelope'

export type SyncStatus = 'off' | 'connecting' | 'synced' | 'offline' | 'conflict'
export type CloudTransport = {
  read(): Promise<{ json: string | null; changeTag: string | null }>
  write(json: string, expectedChangeTag: string | null): Promise<string>
}
export type ReplicatorOptions = {
  transport: CloudTransport
  getState(): FocusState
  applyState(state: FocusState): void
  onStatus(status: SyncStatus, message?: string): void
  now?: () => number
}

/** One compare-and-swap writer per device. Polling/lifecycle belong to the host. */
export class FocusReplicator {
  private status: SyncStatus = 'off'
  private stopped = false
  private requested = false
  private pending: Promise<void> | null = null
  constructor(private options: ReplicatorOptions) {}

  stop() {
    this.stopped = true
    this.requested = false
  }

  sync(): Promise<void> {
    if (this.stopped) return Promise.resolve()
    this.requested = true
    if (!this.pending) this.pending = this.flush().finally(() => { this.pending = null })
    return this.pending
  }

  private report(status: SyncStatus, message?: string) {
    this.status = status
    this.options.onStatus(status, message)
  }

  private async flush(): Promise<void> {
    const { transport, getState, applyState } = this.options
    if (this.status !== 'synced' && this.status !== 'conflict') this.report('connecting')
    while (this.requested && !this.stopped) {
      this.requested = false
      let complete = false
      for (let attempt = 0; attempt < 4 && !this.stopped; attempt++) {
        try {
          const remote = await transport.read()
          if (this.stopped) return
          if (remote.json !== null) {
            const parsed = parseSyncEnvelope(remote.json)
            if (!parsed) throw new Error('지원하지 않는 동기화 데이터입니다. 앱을 업데이트해 주세요.')
            const local = getState()
            const merged = focusReducer(local, { ...parsed, type: 'sync', now: (this.options.now ?? Date.now)() })
            if (serializeFocusState(merged) !== serializeFocusState(local)) applyState(merged)
          }
          const payload = serializeFocusState(getState())
          if (payload !== remote.json) await transport.write(payload, remote.changeTag)
          if (this.stopped) return
          // A local edit during the network write must get a second pass.
          if (payload !== serializeFocusState(getState())) this.requested = true
          complete = true
          break
        } catch (error) {
          if (this.stopped) return
          const message = error instanceof Error ? error.message : String(error)
          if (/conflict|serverRecordChanged|record.*changed/i.test(message) && attempt < 3) continue
          this.report('offline', message)
          return
        }
      }
      if (complete && !this.stopped) this.report(getState().conflicts?.length ? 'conflict' : 'synced')
    }
  }
}
