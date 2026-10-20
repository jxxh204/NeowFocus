import { describe, expect, it } from 'vitest'
import { achievementForDay, isFeedbackCompletion } from './achievement'
import { finishFocus, pauseFocus, startFocus } from './session'
import { toRecord } from './records'

const now = new Date(2026, 9, 14, 12).getTime()
const session = startFocus({ id: 'one', task: '읽기', plannedMs: 25 * 60_000, now, deviceId: 'phone' })

describe('focus achievements', () => {
  it('counts brief and duplicate deliveries once without counting conflict cancellations', () => {
    const finished = finishFocus(session, now + 20_000, 'phone')
    const record = toRecord(finished)!
    const result = achievementForDay([record, record, { ...record, id: 'conflict', finishReason: 'conflict' }], now + 30_000)
    expect(result).toMatchObject({ count: 1, focusedMs: 20_000, tasks: ['읽기'] })
  })
  it('groups by the local completion date, including a focus started yesterday', () => {
    const midnight = new Date(2026, 9, 15).getTime()
    const first = toRecord(finishFocus(session, now + 1000, 'phone'))!
    const overnight = { ...first, id: 'overnight', startedAt: midnight - 10_000, finishedAt: midnight + 1000 }
    expect(achievementForDay([first, overnight], midnight + 2000).records.map(record => record.id)).toEqual(['overnight'])
  })
  it('allows local manual completion from paused state but excludes restored and remote completions', () => {
    const paused = pauseFocus(session, now + 1000, 'phone')
    const done = finishFocus(paused, now + 2000, 'phone')
    expect(isFeedbackCompletion(paused, done, 'phone', now + 2100)).toBe(true)
    expect(isFeedbackCompletion(null, done, 'phone', now + 2100)).toBe(false)
    expect(isFeedbackCompletion(paused, done, 'mac', now + 2100)).toBe(false)
    expect(isFeedbackCompletion(paused, { ...done, finishReason: undefined, updatedBy: 'mac' }, 'phone', now + 2100)).toBe(false)
    expect(isFeedbackCompletion(paused, done, 'phone', now + 6000)).toBe(false)
    expect(isFeedbackCompletion(done, done, 'phone', now + 2100)).toBe(false)
    expect(isFeedbackCompletion(paused, done, 'phone', now + 2100, now + 2050)).toBe(false)
  })
})
