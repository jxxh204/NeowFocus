import Button from '@renderer/component/Button'
import TextField from '@renderer/component/TextField'
import { useState } from 'react'
import styled from 'styled-components'

const MainStyle = styled.form`
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 100%;
`

function Input() {
  const [text, setText] = useState('')
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }
  return (
    <MainStyle>
      <TextField
        placeholder="지금 집중할 일을 적어볼까요?"
        onChange={onChange}
        maxLength={22}
        hovered={text.length === 0}
      />
      <Button value="시작" type="filled" disabled={text.length === 0} />
    </MainStyle>
  )
}

export default Input
