import { useTaskContext, type TaskStatus } from '@renderer/context/TaskContext'
import { TIME } from '@renderer/constants'

export type TimerState = TaskStatus

/**
 * 타이머 화면용 값. 시간 계산과 멈춤·재개는 TaskContext(공통 코어)가 맡고,
 * 이 훅은 화면이 쓰는 형태로만 꺼내준다.
 */
export const useTimer = () => {
  const { taskStatus, remainingTime, percentage, pauseTask, resumeTask } = useTaskContext()

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / TIME.SECONDS_PER_MINUTE)
    const seconds = time % TIME.SECONDS_PER_MINUTE
    return `${minutes.toString().padStart(TIME.TIME_DISPLAY_PADDING, '0')}:${seconds.toString().padStart(TIME.TIME_DISPLAY_PADDING, '0')}`
  }

  return {
    timerState: taskStatus,
    remainingTime,
    percentage,
    formatTime,
    handlePause: pauseTask,
    handleResume: resumeTask
  }
}
