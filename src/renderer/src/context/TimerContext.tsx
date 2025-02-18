import { createContext, useContext, useEffect, useState } from 'react'

type TimerContextType = {
  timer: number
  setTimer: (timer: number) => void
  isEnd: boolean
  initTimer: () => void
}

const TimerContext = createContext<TimerContextType | null>(null)

const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState(5)
  const [isEnd, setIsEnd] = useState(false)

  const initTimer = () => {
    setTimer(5)
    setIsEnd(false)
  }

  useEffect(() => {
    if (timer <= 0) {
      setIsEnd(true)
    }
  }, [timer])

  return (
    <TimerContext.Provider value={{ timer, setTimer, isEnd, initTimer }}>
      {children}
    </TimerContext.Provider>
  )
}

const useTimerContext = () => {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('TimerContext not found')
  }
  return context
}

export { TimerProvider, useTimerContext }
