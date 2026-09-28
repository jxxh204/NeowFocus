/**
 * 집중 한 번(세션)의 상태와 전환 규칙.
 *
 * 남은 시간을 매초 저장하지 않고 종료 예정 시각(endsAt)만 저장한다.
 * 앱이 백그라운드에 있다 돌아와도, 다른 기기가 같은 세션을 받아도
 * `now`만 있으면 같은 남은 시간을 계산할 수 있다.
 *
 * 모든 함수는 순수 함수이며 현재 시각과 기기 id를 인자로 받는다.
 * 맞지 않는 상태 전환은 예외 대신 입력을 그대로 돌려준다 — 다른 기기의
 * 변경과 겹쳐 들어와도 화면이 깨지지 않게 하기 위해서다.
 */

export type FocusStatus = 'running' | 'paused' | 'finished'

export type FocusSession = {
  id: string
  task: string
  plannedMs: number
  startedAt: number
  status: FocusStatus
  /** running일 때만 값이 있다 */
  endsAt: number | null
  /** paused일 때 기준이 되는 남은 시간 */
  remainingMs: number
  finishedAt: number | null
  /** finished일 때 확정되는 실제 집중 시간(멈춘 시간 제외) */
  focusedMs: number
  /** 계획한 시간을 다 채웠는지 */
  completed: boolean
  /** 동기화 시 최신 변경을 가리기 위한 값 */
  updatedAt: number
  updatedBy: string
}

export type StartInput = {
  id: string
  task: string
  plannedMs: number
  now: number
  deviceId: string
}

export function startFocus({ id, task, plannedMs, now, deviceId }: StartInput): FocusSession {
  const trimmed = task.trim()
  if (!trimmed) throw new Error('할 일을 입력해야 집중을 시작할 수 있습니다.')
  if (!(plannedMs > 0)) throw new Error('집중 시간은 0보다 커야 합니다.')

  return {
    id,
    task: trimmed,
    plannedMs,
    startedAt: now,
    status: 'running',
    endsAt: now + plannedMs,
    remainingMs: plannedMs,
    finishedAt: null,
    focusedMs: 0,
    completed: false,
    updatedAt: now,
    updatedBy: deviceId
  }
}

export function remainingOf(session: FocusSession, now: number): number {
  switch (session.status) {
    case 'running':
      return Math.max(0, (session.endsAt ?? now) - now)
    case 'paused':
      return session.remainingMs
    case 'finished':
      return 0
  }
}

export function progressOf(session: FocusSession, now: number): number {
  if (session.plannedMs <= 0) return 1
  return Math.min(1, Math.max(0, 1 - remainingOf(session, now) / session.plannedMs))
}

export function pauseFocus(session: FocusSession, now: number, deviceId: string): FocusSession {
  if (session.status !== 'running') return session
  const remainingMs = remainingOf(session, now)
  if (remainingMs === 0) return settleFocus(session, now)
  return { ...session, status: 'paused', endsAt: null, remainingMs, updatedAt: now, updatedBy: deviceId }
}

export function resumeFocus(session: FocusSession, now: number, deviceId: string): FocusSession {
  if (session.status !== 'paused') return session
  return {
    ...session,
    status: 'running',
    endsAt: now + session.remainingMs,
    updatedAt: now,
    updatedBy: deviceId
  }
}

/** 사용자가 직접 마친다. 시간을 다 채우지 않았어도 된다. */
export function finishFocus(session: FocusSession, now: number, deviceId: string): FocusSession {
  if (session.status === 'finished') return session
  const remainingMs = remainingOf(session, now)
  if (remainingMs === 0) return settleFocus(session, now)
  return toFinished(session, { finishedAt: now, remainingMs, updatedBy: deviceId })
}

/**
 * 종료 시각이 지난 running 세션을 완료로 바꾼다. 완료 시각은 확인한 시각이 아닌 endsAt이라,
 * 두 기기가 각자 완료를 확인해도 같은 결과가 나온다.
 */
export function settleFocus(session: FocusSession, now: number): FocusSession {
  if (session.status !== 'running' || session.endsAt === null || now < session.endsAt) return session
  return toFinished(session, { finishedAt: session.endsAt, remainingMs: 0, updatedBy: session.updatedBy })
}

function toFinished(
  session: FocusSession,
  { finishedAt, remainingMs, updatedBy }: { finishedAt: number; remainingMs: number; updatedBy: string }
): FocusSession {
  return {
    ...session,
    status: 'finished',
    endsAt: null,
    remainingMs: 0,
    finishedAt,
    focusedMs: session.plannedMs - remainingMs,
    completed: remainingMs === 0,
    updatedAt: finishedAt,
    updatedBy
  }
}

/** 남은 시간을 분:초로. 초는 올림해서 시작 직후에도 25:00으로 보인다. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
