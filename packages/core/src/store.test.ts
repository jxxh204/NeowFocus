import { describe, expect, it } from 'vitest'
import { EMPTY_STATE, focusReducer, type FocusState } from './store'
import { groupRecordsByDay } from './records'

const MIN = 60_000
const T0 = new Date(2026, 8, 29, 9, 0, 0).getTime()

const startAction = (id = 's1', now = T0) =>
  ({ type: 'start', id, task: '기획안 첫 문단 쓰기', plannedMs: 25 * MIN, now, deviceId: 'phone' }) as const

const run = (...actions: Parameters<typeof focusReducer>[1][]): FocusState =>
  actions.reduce(focusReducer, EMPTY_STATE)

describe('focusReducer', () => {
  it('집중을 마치면 기록을 한 건 남기고 완료 화면용 세션은 유지한다', () => {
    const state = run(startAction(), { type: 'tick', now: T0 + 26 * MIN })
    expect(state.current?.status).toBe('finished')
    expect(state.records).toHaveLength(1)
    expect(state.records[0]).toMatchObject({ id: 's1', focusedMs: 25 * MIN, completed: true })
  })

  it('같은 세션의 완료가 여러 번 와도 기록은 한 건이다', () => {
    const state = run(
      startAction(),
      { type: 'tick', now: T0 + 26 * MIN },
      { type: 'tick', now: T0 + 27 * MIN },
      { type: 'finish', now: T0 + 28 * MIN, deviceId: 'mac' }
    )
    expect(state.records).toHaveLength(1)
  })

  it('진행 중인 집중이 있으면 새 집중을 시작하지 않는다', () => {
    const state = run(startAction('s1'), startAction('s2', T0 + MIN))
    expect(state.current?.id).toBe('s1')
  })

  it('완료 화면을 닫으면 시작 전 상태로 돌아간다', () => {
    const state = run(startAction(), { type: 'finish', now: T0 + 10 * MIN, deviceId: 'phone' }, { type: 'dismiss' })
    expect(state.current).toBeNull()
    expect(state.records).toHaveLength(1)
  })

  it('1분 미만으로 마친 집중은 기록하지 않는다', () => {
    const state = run(startAction(), { type: 'finish', now: T0 + 30_000, deviceId: 'phone' })
    expect(state.current?.status).toBe('finished')
    expect(state.records).toHaveLength(0)
  })
})

describe('groupRecordsByDay', () => {
  it('날짜별로 묶어 최신 날짜부터 보여준다', () => {
    const day = (d: number, h: number) => new Date(2026, 8, d, h).getTime()
    const record = (id: string, finishedAt: number, focusedMs: number) => ({
      id,
      task: id,
      plannedMs: 25 * MIN,
      focusedMs,
      completed: true,
      startedAt: finishedAt - focusedMs,
      finishedAt
    })
    const groups = groupRecordsByDay([
      record('a', day(28, 10), 25 * MIN),
      record('b', day(29, 9), 25 * MIN),
      record('c', day(29, 15), 10 * MIN)
    ])
    expect(groups.map((g) => g.day)).toEqual(['2026-09-29', '2026-09-28'])
    expect(groups[0]).toMatchObject({ focusedMs: 35 * MIN })
    expect(groups[0]?.records.map((r) => r.id)).toEqual(['c', 'b'])
  })
})
