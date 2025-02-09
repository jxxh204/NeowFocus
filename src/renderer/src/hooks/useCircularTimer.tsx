import { useEffect, useState } from 'react'

type StateType = 'idle' | 'play' | 'pause'
type Props = {
  duration: number
  initialTime?: number
}

const useCircularTimer = ({ duration, initialTime = duration }: Props) => {
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
