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

  const onSubmitHandler = () => {
    startTask(text)
    navigate(ROUTES.FOCUS)
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    // 줄바꿈(\n) 개수 세기
    const newlineCount = (newValue.match(/\n/g) || []).length

    // 줄바꿈이 1개 이하일 때만 허용
    if (newlineCount <= 1) {
      setText(newValue)
    }
  }

  return (
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
        />
      </Container.Body>
      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        <Container.Button type="submit" onClick={onSubmitHandler} disabled={text.length === 0}>
          뽀모도로 시작
          <Icon name="timer" alt="timer" size={16} />
        </Container.Button>
      </Container.Bottom>
    </Container>
  )
}

export default InputPage
