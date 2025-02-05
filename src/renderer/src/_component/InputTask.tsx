import styled from 'styled-components'
import { T_ChangeHandler, TaskName } from '@renderer/types/task'

const InputTaskStyle = styled.input`
  color: gray;
  border: 1px solid ${({ theme }) => theme.border.color};
  border-radius: ${({ theme }) => theme.border.radius};
  width: 94%;
  padding: 10px 3%;
`

type Props = {
  name: TaskName
  onChange: T_ChangeHandler
}

function InputTask({ name, onChange }: Props) {
  return <InputTaskStyle type="text" name={name} onChange={onChange} />
}

export default InputTask
