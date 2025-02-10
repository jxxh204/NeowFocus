import { createContext, useContext, useState } from 'react'

type TimerContextType = {
  timer: number
  setTimer: (timer: number) => void
}

const TimerContext = createContext<TimerContextType | null>(null)

const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState(1500)
  console.log('timer', timer)
  return <TimerContext.Provider value={{ timer, setTimer }}>{children}</TimerContext.Provider>
}

const useTimerContext = () => {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('TimerContext not found')
  }
  return context
}

export { TimerProvider, useTimerContext }
