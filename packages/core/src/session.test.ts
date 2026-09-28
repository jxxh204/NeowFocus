import { describe, expect, it } from 'vitest'
import {
  finishFocus,
  formatClock,
  pauseFocus,
  progressOf,
  remainingOf,
  resumeFocus,
  settleFocus,
  startFocus
} from './session'

const MIN = 60_000
const T0 = Date.UTC(2026, 8, 29, 1, 0, 0)

const start = (overrides: Partial<Parameters<typeof startFocus>[0]> = {}) =>
  startFocus({ id: 's1', task: '기획안 첫 문단 쓰기', plannedMs: 25 * MIN, now: T0, deviceId: 'mac', ...overrides })

describe('startFocus', () => {
  it('종료 예정 시각을 기준으로 집중을 시작한다', () => {
    const s = start()
    expect(s.status).toBe('running')
    expect(s.endsAt).toBe(T0 + 25 * MIN)
    expect(remainingOf(s, T0 + 5 * MIN)).toBe(20 * MIN)
    expect(s.updatedBy).toBe('mac')
  })

  it('할 일 앞뒤 공백을 지운다', () => {
    expect(start({ task: '  메일 정리  ' }).task).toBe('메일 정리')
  })

  it('빈 할 일이나 0분 이하로는 시작하지 않는다', () => {
    expect(() => start({ task: '   ' })).toThrow()
    expect(() => start({ plannedMs: 0 })).toThrow()
  })
})

describe('pauseFocus / resumeFocus', () => {
  it('멈춘 동안은 시간이 흐르지 않는다', () => {
    const paused = pauseFocus(start(), T0 + 10 * MIN, 'phone')
    expect(paused.status).toBe('paused')
    expect(paused.updatedBy).toBe('phone')
    expect(remainingOf(paused, T0 + 50 * MIN)).toBe(15 * MIN)

    const resumed = resumeFocus(paused, T0 + 30 * MIN, 'mac')
    expect(resumed.status).toBe('running')
    expect(resumed.endsAt).toBe(T0 + 45 * MIN)
    expect(remainingOf(resumed, T0 + 40 * MIN)).toBe(5 * MIN)
  })

  it('시간이 이미 끝났다면 멈추는 대신 완료 처리한다', () => {
    const s = pauseFocus(start(), T0 + 26 * MIN, 'phone')
    expect(s.status).toBe('finished')
    expect(s.completed).toBe(true)
  })

  it('맞지 않는 상태 전환은 무시한다', () => {
    const running = start()
    expect(resumeFocus(running, T0, 'mac')).toBe(running)
    const paused = pauseFocus(running, T0 + MIN, 'mac')
    expect(pauseFocus(paused, T0 + 2 * MIN, 'mac')).toBe(paused)
  })
})

describe('settleFocus', () => {
  it('종료 시각이 지나면 그 시각에 완료된 것으로 기록한다', () => {
    const s = settleFocus(start(), T0 + 40 * MIN)
    expect(s.status).toBe('finished')
    expect(s.completed).toBe(true)
    expect(s.finishedAt).toBe(T0 + 25 * MIN)
    expect(s.focusedMs).toBe(25 * MIN)
  })

  it('아직 시간이 남았으면 그대로 둔다', () => {
    const s = start()
    expect(settleFocus(s, T0 + MIN)).toBe(s)
  })
})

describe('finishFocus', () => {
  it('일찍 마치면 실제로 집중한 시간만 남긴다', () => {
    const s = finishFocus(start(), T0 + 12 * MIN, 'phone')
    expect(s.status).toBe('finished')
    expect(s.completed).toBe(false)
    expect(s.focusedMs).toBe(12 * MIN)
    expect(s.finishedAt).toBe(T0 + 12 * MIN)
  })

  it('멈춘 시간은 집중 시간에서 뺀다', () => {
    const paused = pauseFocus(start(), T0 + 5 * MIN, 'mac')
    const s = finishFocus(paused, T0 + 60 * MIN, 'mac')
    expect(s.focusedMs).toBe(5 * MIN)
  })
})

describe('표시용 계산', () => {
  it('남은 시간을 올림한 분:초로 보여준다', () => {
    expect(formatClock(25 * MIN)).toBe('25:00')
    expect(formatClock(25 * MIN - 1)).toBe('25:00')
    expect(formatClock(61_000)).toBe('01:01')
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(-5)).toBe('00:00')
  })

  it('진행률은 0에서 1 사이다', () => {
    const s = start()
    expect(progressOf(s, T0)).toBe(0)
    expect(progressOf(s, T0 + 12.5 * MIN)).toBe(0.5)
    expect(progressOf(s, T0 + 99 * MIN)).toBe(1)
  })
})
