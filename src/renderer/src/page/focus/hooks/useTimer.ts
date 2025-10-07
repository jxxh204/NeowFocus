import { useState, useEffect } from 'react'
import { TIME } from '@renderer/constants'

export type TimerState = 'idle' | 'play' | 'pause' | 'end'

interface UseTimerOptions {
  onTick?: (remainingTime: number, timerState: TimerState) => void
  initialState?: TimerState
}

interface UseTimerReturn {
  timerState: TimerState
  remainingTime: number
  percentage: number
  formatTime: (time: number) => string
  handlePause: () => void
  handleResume: () => void
  handleStop: () => void
  handleReset: () => void
}

export const useTimer = (
  initialDuration: number,
  fullDuration: number,
  options?: UseTimerOptions
): UseTimerReturn => {
  const [timerState, setTimerState] = useState<TimerState>(options?.initialState || 'play')
  const [remainingTime, setRemainingTime] = useState(initialDuration)

  // initialDuration이 변경되면 타이머 리셋
  useEffect(() => {
    setRemainingTime(initialDuration)
    if (initialDuration === fullDuration) {
      setTimerState(options?.initialState || 'play')
    }
  }, [initialDuration, fullDuration, options?.initialState])

  useEffect(() => {
    if (timerState !== 'play') return

    const interval = setInterval(() => {
      setRemainingTime((prev: number) => {
        const newTime = prev <= 1 ? 0 : prev - 1
        const newState = prev <= 1 ? 'end' : timerState

        // Event-based callback instead of useEffect
        if (options?.onTick) {
          options.onTick(newTime, newState)
        }

        if (prev <= 1) {
          setTimerState('end')
        }
        return newTime
      })
    }, TIME.TIMER_INTERVAL)

    return () => clearInterval(interval)
  }, [timerState, options])

  const percentage = fullDuration > 0 ? (remainingTime / fullDuration) * 100 : 0

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / TIME.SECONDS_PER_MINUTE)
    const seconds = time % TIME.SECONDS_PER_MINUTE
    return `${minutes.toString().padStart(TIME.TIME_DISPLAY_PADDING, '0')}:${seconds.toString().padStart(TIME.TIME_DISPLAY_PADDING, '0')}`
  }

  const handlePause = () => setTimerState('pause')
  const handleResume = () => setTimerState('play')
  const handleStop = () => setTimerState('end')
  const handleReset = () => {
    setRemainingTime(fullDuration)
    setTimerState('play')
  }

  return {
    timerState,
    remainingTime,
    percentage,
    formatTime,
    handlePause,
    handleResume,
    handleStop,
    handleReset
  }
}
