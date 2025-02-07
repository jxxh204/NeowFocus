import { useEffect, useState } from 'react'
import { TimerProps } from './CircularTimer'

type StateType = 'idle' | 'play' | 'pause'

const useCircularTimer = ({ duration, initialTime = duration }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [status, setStatus] = useState<StateType>('idle')

  const handleStatus = (newStatus: StateType) => {
    setStatus(newStatus)
  }

  useEffect(() => {
    if (status == 'play' || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeLeft])

  return { timeLeft, status, handleStatus }
}

export default useCircularTimer
