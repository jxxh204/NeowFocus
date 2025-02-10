import { useTimerContext } from '@renderer/context/TimerContext'
import { useEffect, useState } from 'react'

type StateType = 'idle' | 'play' | 'pause' | 'end'
type Props = {
  duration: number
  initialTime?: number
}

const useCircularTimer = ({ duration, initialTime = duration }: Props) => {
  const { setTimer } = useTimerContext()

  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [status, setStatus] = useState<StateType>('idle')

  const handleStatus = (newStatus: StateType) => {
    setStatus(newStatus)
  }

  useEffect(() => {
    if (status == 'play') return
    if (timeLeft <= 0) {
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
