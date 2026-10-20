import { pauseFocus, resumeFocus, type FocusSession } from './session'

/** Durable widget intent. Its causal base makes concurrent delivery order irrelevant. */
export type NativeFocusCommand = {
  id: string
  sessionId: string
  action: 'pause' | 'resume'
  issuedAt: number
  revision: number
  deviceId: string
  /** New widget commands include the pre-action session. Older local queues may omit it. */
  baseSession?: FocusSession
}

export function nativeCommandResult(command: NativeFocusCommand, fallback?: FocusSession): FocusSession | null {
  const base = command.baseSession ?? fallback
  if (!base || base.id !== command.sessionId || command.revision !== (base.revision ?? 0) + 1
    || command.issuedAt < base.startedAt || !Number.isFinite(command.issuedAt)
    || !(command.action === 'pause' && base.status === 'running'
      || command.action === 'resume' && base.status === 'paused')) return null
  const result = command.action === 'pause'
    ? pauseFocus(base, command.issuedAt, command.deviceId)
    : resumeFocus(base, command.issuedAt, command.deviceId)
  return result.revision === command.revision ? result : null
}
