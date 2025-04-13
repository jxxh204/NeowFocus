import { useEffect, useState } from 'react'
import { useTaskContext } from '@renderer/context/TaskContext'
export type StateType = 'idle' | 'play' | 'pause' | 'end'

// TODO : TASK가 의존되어있음. Duration을 분리하여 의존성 제거 필요.
const useCircularTimer = () => {
  const { updateDuration, currentTask } = useTaskContext()
  const [timeLeft, setTimeLeft] = useState(
    currentTask.taskDuration ? currentTask.taskDuration : currentTask.fullDuration
  )
  const [status, setStatus] = useState<StateType>('idle')

  const handleStatus = (newStatus: StateType) => {
    setStatus(newStatus)
  }

  // TODO : 같은 상태를 두곳에서 관리중이다. 개선이 필요
  useEffect(() => {
    if (status == 'play') return
    if (timeLeft < 0) {
      setStatus('end')
      return
    }
    updateDuration(timeLeft)
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeLeft])

  return { timeLeft, fullTime: currentTask.fullDuration, status, handleStatus }
}

export default useCircularTimer
