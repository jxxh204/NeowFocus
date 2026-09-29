import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { TaskProvider, useTaskContext } from '../TaskContext'
import { SettingsProvider } from '../SettingsContext'

const T0 = new Date('2026-09-29T09:00:00.000Z').getTime()

describe('TaskContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider>
      <TaskProvider>{children}</TaskProvider>
    </SettingsProvider>
  )
  const render = () => renderHook(() => useTaskContext(), { wrapper })
  const advance = (ms: number) => act(() => jest.advanceTimersByTime(ms))

  beforeEach(() => {
    jest.useFakeTimers({ now: T0 })
    localStorage.clear()
    ;(window as any).electron.showNotification = jest.fn()
    ;(window as any).electron.showWindow = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('처음에는 시작 전 상태다', () => {
    const { result } = render()
    expect(result.current.taskStatus).toBe('idle')
    expect(result.current.currentTask.taskName).toBe('')
  })

  it('시작하면 기본 25분부터 줄어든다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    expect(result.current.taskStatus).toBe('play')
    expect(result.current.remainingTime).toBe(1500)
    expect(result.current.percentage).toBe(100)

    advance(60_000)
    expect(result.current.remainingTime).toBe(1440)
  })

  it('멈춘 동안은 줄지 않고, 재개하면 이어간다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    advance(10_000)
    act(() => result.current.pauseTask())
    advance(60_000)
    expect(result.current.taskStatus).toBe('pause')
    expect(result.current.remainingTime).toBe(1490)

    act(() => result.current.resumeTask())
    advance(5_000)
    expect(result.current.remainingTime).toBe(1485)
  })

  it('타이머가 늦게 불려도 종료 시각 기준으로 남은 시간을 계산한다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    // 창이 숨겨져 interval이 멈춘 상황: 시계만 흐르고 한 번만 깨어난다
    act(() => {
      jest.setSystemTime(T0 + 10 * 60_000)
      jest.advanceTimersByTime(1_000)
    })
    expect(result.current.remainingTime).toBe(899)
  })

  it('시간이 다 되면 완료되고 알림을 띄운다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    advance(1500 * 1000)
    expect(result.current.taskStatus).toBe('end')
    expect(result.current.currentTask.fullDuration).toBe(1500)
    expect(window.electron.showNotification).toHaveBeenCalledTimes(1)
    expect(window.electron.showWindow).toHaveBeenCalledTimes(1)
  })

  it('일찍 마치면 집중한 시간만 남기고 알림은 띄우지 않는다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    advance(12 * 60_000)
    act(() => result.current.completeEarly())
    expect(result.current.taskStatus).toBe('end')
    expect(result.current.currentTask.fullDuration).toBe(720)
    expect(window.electron.showNotification).not.toHaveBeenCalled()
  })

  it('완료한 작업을 기록에 저장하고 같은 일을 다시 시작할 수 있다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    act(() => result.current.completeEarly())
    act(() => result.current.saveTaskToList())
    act(() => result.current.reStartTask())

    expect(result.current.taskList).toHaveLength(1)
    expect(result.current.taskList[0]).toMatchObject({ taskName: '보고서 쓰기', sessionCount: 1 })
    expect(result.current.taskStatus).toBe('play')
    expect(result.current.currentTask.taskName).toBe('보고서 쓰기')
  })

  it('중지하면 기록 없이 시작 전으로 돌아간다', () => {
    const { result } = render()
    act(() => result.current.startTask('보고서 쓰기'))
    act(() => result.current.resetCurrentTask())
    expect(result.current.taskStatus).toBe('idle')
    expect(result.current.taskList).toHaveLength(0)
  })

  it('앱을 다시 열어도 진행 중인 집중이 종료 시각 기준으로 이어진다', () => {
    const first = render()
    act(() => first.result.current.startTask('보고서 쓰기'))
    first.unmount()

    jest.setSystemTime(T0 + 5 * 60_000)
    const { result } = render()
    expect(result.current.taskStatus).toBe('play')
    expect(result.current.remainingTime).toBe(1200)
  })

  it('이전 버전의 진행 중 작업을 새 형식으로 옮긴다', () => {
    localStorage.setItem(
      'currentTask',
      JSON.stringify({
        id: 'old-1',
        date: '2026-09-29T08:00:00.000Z',
        taskName: '이전 작업',
        taskDuration: 600,
        fullDuration: 1500,
        taskStatus: 'pause',
        sessionCount: 1
      })
    )
    const { result } = render()
    expect(result.current.currentTask).toMatchObject({
      id: 'old-1',
      taskName: '이전 작업',
      taskStatus: 'pause',
      taskDuration: 600
    })
    expect(localStorage.getItem('currentTask')).toBeNull()
  })
})
