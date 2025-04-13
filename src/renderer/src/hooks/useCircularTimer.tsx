import { useTimerContext } from '@renderer/context/TimerContext'
import { useEffect, useState } from 'react'

export type StateType = 'idle' | 'play' | 'pause' | 'end'
type Props = {
  duration: number
}

const useCircularTimer = ({ duration }: Props) => {
  const { setTimer } = useTimerContext()
  // TODO : timerContext와 중복되므로 상태 관리 중복 제거 필요
  const [timeLeft, setTimeLeft] = useState(duration)
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
    setTimer(timeLeft)
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeLeft])

  return { timeLeft, status, handleStatus }
}

export default useCircularTimer
