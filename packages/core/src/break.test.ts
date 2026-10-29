import { describe, expect, it } from 'vitest'
import { startFocus, finishFocus, settleFocus } from './session'
import { AUTO_BREAK_MS, breakAfterCompletion, restoreFocusBreak } from './break'

const running = startFocus({
  id: 'focus-1',
  task: '작업',
  plannedMs: 60_000,
  now: 1000,
  deviceId: 'mac'
})

describe('automatic break', () => {
  it('starts ten minutes at the real completion time, including manual completion', () => {
    const timed = settleFocus(running, 999_000)
    expect(breakAfterCompletion(timed, true)).toEqual({
      sessionId: 'focus-1',
      endsAt: 61_000 + AUTO_BREAK_MS
    })
    expect(breakAfterCompletion(finishFocus(running, 5000, 'mac'), true)?.endsAt).toBe(
      5000 + AUTO_BREAK_MS
    )
  })
  it('keeps disabled and unfinished/conflict sessions out of a break', () => {
    const done = finishFocus(running, 5000, 'mac')
    expect(breakAfterCompletion(done, false)?.endsAt).toBeNull()
    expect(breakAfterCompletion(running, true)).toBeNull()
    expect(breakAfterCompletion({ ...done, finishReason: 'conflict' }, true)).toBeNull()
  })
  it('restores the deadline or skip marker instead of granting another ten minutes', () => {
    const done = finishFocus(running, 5000, 'mac'),
      saved = breakAfterCompletion(done, true)!
    expect(restoreFocusBreak(done, saved, true)).toEqual(saved)
    expect(restoreFocusBreak(done, { ...saved, endsAt: null }, true)?.endsAt).toBeNull()
    expect(restoreFocusBreak(done, saved, false)?.endsAt).toBeNull()
    expect(restoreFocusBreak(done, { ...saved, endsAt: 99_999_999 }, true)).toEqual(saved)
    expect(restoreFocusBreak(done, { sessionId: 'other', endsAt: null }, true)).toEqual(saved)
  })
})
