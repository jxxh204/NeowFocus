import { remainingOf } from '@neowfocus/core'
import { sessionFromLegacyTask } from '../legacySession'

const NOW = Date.UTC(2026, 8, 29, 3, 0, 0)

describe('sessionFromLegacyTask', () => {
  const legacy = {
    id: 'old-1',
    date: '2026-09-29T02:00:00.000Z',
    taskName: '보고서 쓰기',
    taskDuration: 600,
    fullDuration: 1500
  }

  it('진행 중이던 작업은 다시 연 시각부터 남은 시간만큼 이어간다', () => {
    const session = sessionFromLegacyTask({ ...legacy, taskStatus: 'play' }, NOW, 'mac')
    expect(session).toMatchObject({
      id: 'old-1',
      task: '보고서 쓰기',
      status: 'running',
      plannedMs: 1_500_000
    })
    expect(remainingOf(session!, NOW)).toBe(600_000)
  })

  it('멈춘 작업은 멈춘 상태로 옮긴다', () => {
    const session = sessionFromLegacyTask({ ...legacy, taskStatus: 'pause' }, NOW, 'mac')
    expect(session?.status).toBe('paused')
    expect(remainingOf(session!, NOW + 60_000)).toBe(600_000)
  })

  it('완료 화면에 있던 작업은 완료로, 집중 시간은 fullDuration으로 옮긴다', () => {
    const session = sessionFromLegacyTask(
      { ...legacy, taskDuration: 0, fullDuration: 720, taskStatus: 'end' },
      NOW,
      'mac'
    )
    expect(session).toMatchObject({ status: 'finished', focusedMs: 720_000 })
  })

  it('작업이 없거나 시작 전이면 옮기지 않는다', () => {
    expect(sessionFromLegacyTask(null, NOW, 'mac')).toBeNull()
    expect(sessionFromLegacyTask({ ...legacy, taskStatus: 'idle' }, NOW, 'mac')).toBeNull()
    expect(
      sessionFromLegacyTask({ ...legacy, taskName: '', taskStatus: 'play' }, NOW, 'mac')
    ).toBeNull()
  })
})
