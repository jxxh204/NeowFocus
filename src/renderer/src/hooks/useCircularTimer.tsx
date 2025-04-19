import { useEffect, useState } from 'react'

export type TimerStatus = 'idle' | 'play' | 'pause' | 'end'

const useCircularTimer = (fullDuration: number) => {
  const [timeLeft, setTimeLeft] = useState(fullDuration)
  const [status, setStatus] = useState<TimerStatus>('idle')

  const handleStatus = (newStatus: TimerStatus) => {
    setStatus(newStatus)
  }

  useEffect(() => {
    if (status == 'play') return
    if (timeLeft < 0) {
      setStatus('end')
      return
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeLeft])

  return { timeLeft, status, handleStatus }
}

export default useCircularTimer
