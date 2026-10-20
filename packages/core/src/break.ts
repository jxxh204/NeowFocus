import type { FocusSession } from './session'

export const AUTO_BREAK_MS = 10 * 60_000
/** Local experience state; a break is never a focus session or an achievement. */
export type FocusBreak = { sessionId: string; endsAt: number | null }

export function breakAfterCompletion(
  session: FocusSession | null,
  enabled: boolean
): FocusBreak | null {
  if (
    !session ||
    session.status !== 'finished' ||
    session.finishReason === 'conflict' ||
    session.finishedAt === null ||
    !Number.isFinite(session.finishedAt)
  )
    return null
  return { sessionId: session.id, endsAt: enabled ? session.finishedAt + AUTO_BREAK_MS : null }
}

/** Keep the original deadline (or skip marker), including after reload or sleep. */
export function restoreFocusBreak(
  session: FocusSession | null,
  saved: unknown,
  enabled: boolean
): FocusBreak | null {
  const next = breakAfterCompletion(session, enabled)
  if (!next || !enabled) return next
  if (
    saved &&
    typeof saved === 'object' &&
    'sessionId' in saved &&
    'endsAt' in saved &&
    saved.sessionId === next.sessionId &&
    (saved.endsAt === null || saved.endsAt === next.endsAt)
  ) {
    return { ...next, endsAt: saved.endsAt === null ? null : next.endsAt }
  }
  return next
}
