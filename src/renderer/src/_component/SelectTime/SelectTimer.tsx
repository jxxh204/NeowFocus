import { ReactNode } from 'react'
import styled from 'styled-components'
import { SelectTimerProvider } from './context'
import { T_ChangeHandler, TaskName } from '@renderer/types/task'

const SelectTimeStyle = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

type Props = {
  children: ReactNode
  value: number
  name: TaskName
  onChange: T_ChangeHandler
}

function SelectTimer({ children, ...reset }: Props) {
  return (
    <SelectTimeStyle>
      <SelectTimerProvider value={reset}>{children}</SelectTimerProvider>
    </SelectTimeStyle>
  )
}

export default SelectTimer
