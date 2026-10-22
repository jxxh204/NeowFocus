export const TIMER_STYLES = ['classic', 'blocks', 'water'] as const
export type TimerStyle = typeof TIMER_STYLES[number]

/** Old installations and unknown saved values keep the incumbent timer. */
export function normalizeTimerAppearance(saved: { timerStyle?: unknown; showRemainingTime?: unknown } | null | undefined) {
  return {
    timerStyle: TIMER_STYLES.includes(saved?.timerStyle as TimerStyle) ? saved!.timerStyle as TimerStyle : 'classic' as TimerStyle,
    showRemainingTime: saved?.showRemainingTime === true
  }
}
