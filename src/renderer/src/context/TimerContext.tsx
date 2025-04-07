import { createContext, useContext, useState } from 'react'

type TimerContextType = {
  timer: number
  setTimer: (timer: number) => void
  isTimerEnd: boolean
  initTimer: () => void
}

const TimerContext = createContext<TimerContextType | null>(null)

const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState(5)

  const initTimer = () => {
    setTimer(5)
  }
  const isTimerEnd = timer <= 0

  return (
    <TimerContext.Provider value={{ timer, setTimer, isTimerEnd, initTimer }}>
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
