import { ReactNode, createContext, useContext } from 'react'
import { T_ChangeHandler } from '@renderer/types/task'

type Props = {
  disabled?: boolean
  value: number | undefined
  name: string
  onChange: T_ChangeHandler | null
}

const SelectTimerContext = createContext<null | Props>(null)

const SelectTimerProvider = ({ children, value }: { children?: ReactNode; value: Props }) => {
  return <SelectTimerContext.Provider value={value}>{children}</SelectTimerContext.Provider>
}

const useSelectTimerContext = () => {
  const context = useContext(SelectTimerContext)
  if (!context) throw new Error('SelectTimer 컨텍스트 없음.')
  return context
}

export { SelectTimerProvider, useSelectTimerContext }
