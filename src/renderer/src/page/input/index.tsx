import Button from '@renderer/component/Button'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import InputTextField from './components/TextField'
import { useState } from 'react'

const MainStyle = styled.form`
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 100%;
`

function InputPage() {
  const navigate = useNavigate()
  const [text, setText] = useState('')

  const onClickHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigate('/focus')
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  return (
    <MainStyle onSubmit={onClickHandler}>
      <InputTextField
        placeholder="지금 집중할 일을 적어볼까요?"
        maxLength={22}
        onChangeHandler={onChangeHandler}
        value={text}
      />
      <Button value="시작" type="filled" disabled={text.length === 0} />
    </MainStyle>
  )
}

export default InputPage
