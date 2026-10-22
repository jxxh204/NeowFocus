export const TIMER_STYLES = ['classic', 'blocks', 'water'] as const
export type TimerStyle = typeof TIMER_STYLES[number]

export type SessionAppearance = { sessionId: string | null; timerStyle: TimerStyle }

/** Completion owns the last active appearance, even if a later preference changes. */
export function sessionAppearance(previous: SessionAppearance | null, sessionId: string | null, active: boolean, selected: TimerStyle): SessionAppearance {
  if (previous?.sessionId === sessionId && !active) return previous
  if (previous?.sessionId === sessionId && previous.timerStyle === selected) return previous
  return { sessionId, timerStyle: selected }
}

/** Old installations and unknown saved values keep the incumbent timer. */
export function normalizeTimerAppearance(saved: { timerStyle?: unknown; showRemainingTime?: unknown } | null | undefined) {
  return {
    timerStyle: TIMER_STYLES.includes(saved?.timerStyle as TimerStyle) ? saved!.timerStyle as TimerStyle : 'classic' as TimerStyle,
    showRemainingTime: saved?.showRemainingTime === true
  }
}
