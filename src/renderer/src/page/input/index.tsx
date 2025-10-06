import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTaskContext } from '@renderer/context/TaskContext'
import Container from '@components/Container'
import Icon from '@components/Icon'
import MinimizeButton from '@components/MinimizeButton'
import catFaceIcon from '@renderer/assets/icon_cat_face.svg'
import timerIcon from '@renderer/assets/icon_timer.svg'
import TextField from '@components/TextField'

function InputPage() {
  const navigate = useNavigate()
  const { startTask } = useTaskContext()
  const [text, setText] = useState('')

  const onSubmitHandler = () => {
    startTask(text)
    navigate('/focus')
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  return (
    <Container>
      <Container.Top height={30}>
        <Icon src={catFaceIcon} alt="cat" size={24} />
        <MinimizeButton />
      </Container.Top>
      <Container.Body height={84} padding="0 12px">
        <TextField
          placeholder="집중이 필요한 일 하나를 적어주세요."
          maxLength={54}
          value={text}
          onChange={onChangeHandler}
        />
      </Container.Body>
      <Container.Bottom height={48}>
        <Container.Button type="submit" onClick={onSubmitHandler} disabled={text.length === 0}>
          뽀모도로 시작
          <Icon src={timerIcon} alt="timer" size={16} />
        </Container.Button>
      </Container.Bottom>
    </Container>
  )
}

export default InputPage
