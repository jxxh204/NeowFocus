import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTaskContext } from '@renderer/context/TaskContext'
import Container from '@components/Container'
import Icon from '@components/Icon'
import MinimizeButton from '@components/MinimizeButton'
import TextField from '@components/TextField'
import { WINDOW_SIZE, INPUT_LIMITS, ROUTES } from '@renderer/constants'

function InputPage() {
  const navigate = useNavigate()
  const { startTask } = useTaskContext()
  const [text, setText] = useState('')

  const onSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.length === 0) return
    startTask(text)
    navigate(ROUTES.FOCUS)
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    // 줄바꿈(\n) 제거
    const sanitizedValue = newValue.replace(/\n/g, '')
    setText(sanitizedValue)
  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmitHandler(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} style={{ display: 'contents' }}>
      <Container width={400}>
        <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
          <Icon name="cat_face" alt="cat" size={24} />
          <MinimizeButton />
        </Container.Top>
        <Container.Body height={WINDOW_SIZE.BODY_SECTION_HEIGHT} padding="0 12px">
          <TextField
            placeholder="집중이 필요한 일 하나를 적어주세요."
            maxLength={INPUT_LIMITS.TASK_NAME_MAX_LENGTH}
            value={text}
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
          />
        </Container.Body>
        <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
          <Container.Button type="submit" disabled={text.length === 0}>
            뽀모도로 시작
            <Icon name="timer" alt="timer" size={16} />
          </Container.Button>
        </Container.Bottom>
      </Container>
    </form>
  )
}

export default InputPage
