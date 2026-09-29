import { describe, expect, it } from 'vitest'
import { finishFocus, pauseFocus, resumeFocus, startFocus } from './session'
import { mergeCurrent, mergeRecords } from './sync'
import { EMPTY_STATE, focusReducer } from './store'

const MIN = 60_000
const T0 = Date.UTC(2026, 8, 29, 1, 0, 0)

const start = (id: string, at: number, deviceId: string) =>
  startFocus({ id, task: `${id} 할 일`, plannedMs: 25 * MIN, now: at, deviceId })

describe('mergeCurrent: 같은 집중', () => {
  it('더 나중에 바꾼 쪽을 따른다', () => {
    const base = start('s1', T0, 'mac')
    const pausedOnPhone = pauseFocus(base, T0 + 5 * MIN, 'phone')
    const resumedOnMac = resumeFocus(pausedOnPhone, T0 + 8 * MIN, 'mac')

    expect(mergeCurrent(pausedOnPhone, resumedOnMac, T0 + 9 * MIN).current).toBe(resumedOnMac)
    expect(mergeCurrent(resumedOnMac, pausedOnPhone, T0 + 9 * MIN).current).toBe(resumedOnMac)
  })

  it('완료는 되돌리지 않는다', () => {
    const base = start('s1', T0, 'mac')
    const finished = finishFocus(base, T0 + 5 * MIN, 'phone')
    const pausedLater = pauseFocus(base, T0 + 6 * MIN, 'mac')
    expect(mergeCurrent(pausedLater, finished, T0 + 7 * MIN).current).toBe(finished)
  })

  it('시각까지 같으면 기기 id로 정해 두 기기가 같은 결과를 낸다', () => {
    const base = start('s1', T0, 'mac')
    const a = pauseFocus(base, T0 + MIN, 'a-device')
    const b = pauseFocus(base, T0 + MIN, 'b-device')
    expect(mergeCurrent(a, b, T0 + 2 * MIN).current).toEqual(
      mergeCurrent(b, a, T0 + 2 * MIN).current
    )
  })
})

describe('mergeCurrent: 다른 집중', () => {
  it('한쪽에만 있으면 그것을 쓴다', () => {
    const s = start('s1', T0, 'mac')
    expect(mergeCurrent(null, s, T0).current).toBe(s)
    expect(mergeCurrent(s, null, T0).current).toBe(s)
  })

  it('둘 다 진행 중이면 나중에 시작한 것을 잇고, 밀려난 집중은 그때까지로 마친다', () => {
    const onMac = start('mac-1', T0, 'mac')
    const onPhone = start('phone-1', T0 + 3 * MIN, 'phone')
    const now = T0 + 10 * MIN

    const result = mergeCurrent(onMac, onPhone, now)
    expect(result.current).toBe(onPhone)
    expect(result.displaced).toMatchObject({ id: 'mac-1', status: 'finished', focusedMs: 10 * MIN })
    expect(mergeCurrent(onPhone, onMac, now).current).toBe(onPhone)
  })

  it('진행 중인 집중이 끝난 집중보다 우선한다', () => {
    const done = finishFocus(start('old', T0, 'mac'), T0 + 5 * MIN, 'mac')
    const active = start('new', T0 + MIN, 'phone')
    const result = mergeCurrent(done, active, T0 + 6 * MIN)
    expect(result.current).toBe(active)
    expect(result.displaced).toBeNull()
  })
})

describe('mergeRecords', () => {
  it('세션 id로 합쳐 중복이 없다', () => {
    const r = (id: string) => ({
      id,
      task: id,
      plannedMs: 25 * MIN,
      focusedMs: 25 * MIN,
      completed: true,
      startedAt: T0,
      finishedAt: T0 + 25 * MIN
    })
    expect(mergeRecords([r('a'), r('b')], [r('b'), r('c')]).map((x) => x.id)).toEqual([
      'a',
      'b',
      'c'
    ])
  })
})

describe("focusReducer 'sync'", () => {
  it('다른 기기의 상태를 합치고, 밀려난 집중도 기록에 남긴다', () => {
    const local = focusReducer(EMPTY_STATE, {
      type: 'start',
      id: 'mac-1',
      task: '보고서',
      plannedMs: 25 * MIN,
      now: T0,
      deviceId: 'mac'
    })
    const remoteCurrent = start('phone-1', T0 + 3 * MIN, 'phone')

    const merged = focusReducer(local, {
      type: 'sync',
      current: remoteCurrent,
      records: [],
      now: T0 + 10 * MIN
    })
    expect(merged.current?.id).toBe('phone-1')
    expect(merged.records.map((r) => r.id)).toEqual(['mac-1'])
    expect(merged.displaced?.id).toBe('mac-1')
  })
})
