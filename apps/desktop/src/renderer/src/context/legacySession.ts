import { startFocus, type FocusSession } from '@neowfocus/core'

/** 1.2.x까지 localStorage 'currentTask'에 저장하던 형태 */
export type LegacyTask = {
  id?: string
  date?: string
  taskName?: string
  /** 남은 초 */
  taskDuration?: number
  /** 계획한 초. 일찍 마친 뒤에는 실제 집중한 초 */
  fullDuration?: number
  taskStatus?: 'idle' | 'play' | 'pause' | 'end'
}

/**
 * 이전 버전의 진행 중 작업을 종료 시각 기반 세션으로 옮긴다.
 * 이전 버전은 앱을 끄면 남은 시간이 그대로 멈춰 있었으므로, 다시 연 시각부터 이어간다.
 */
export function sessionFromLegacyTask(
  task: LegacyTask | null,
  now: number,
  deviceId: string
): FocusSession | null {
  const status = task?.taskStatus
  if (!task?.taskName || !status || status === 'idle') return null

  const fullMs = Math.max(1, task.fullDuration ?? 0) * 1000
  const remainingMs = Math.min(fullMs, Math.max(0, task.taskDuration ?? 0) * 1000)
  const startedAt = task.date ? Date.parse(task.date) || now : now
  const base = startFocus({
    id: task.id || `legacy-${startedAt}`,
    task: task.taskName,
    plannedMs: fullMs,
    now: startedAt,
    deviceId
  })

  if (status === 'end') {
    return {
      ...base,
      status: 'finished',
      endsAt: null,
      remainingMs: 0,
      finishedAt: now,
      focusedMs: fullMs,
      completed: true,
      updatedAt: now
    }
  }
  if (status === 'pause' || remainingMs === 0) {
    return { ...base, status: 'paused', endsAt: null, remainingMs, updatedAt: now }
  }
  return { ...base, endsAt: now + remainingMs, remainingMs, updatedAt: now }
}
