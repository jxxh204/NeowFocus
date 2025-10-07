import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import { WINDOW_SIZE } from '@renderer/constants'
import TimerCompletion from './components/TimerCompletion'
import CompletionActions from './components/CompletionActions'
import Container from '@components/Container'
import MinimizeButton from '@components/MinimizeButton'
import Icon from '@renderer/component/Icon'

export default function FocusCompleted(): JSX.Element {
  const navigate = useNavigate()
  const { currentTask, resetCurrentTask, reStartTask, incrementSession } = useTaskContext()

  // 이벤트 핸들러: 새 작업 시작
  const handleNewTask = () => {
    resetCurrentTask()
    navigate('/')
  }

  // 이벤트 핸들러: 같은 작업 반복
  const handleRepeat = () => {
    incrementSession()
    reStartTask()
  }

  return (
    <Container width={400}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
        <IconGroup>
          <Icon name="cat_face" alt="cat" size={24} />
          <Icon name="bubble" alt="bubble_focus" height={16} width={68} />
        </IconGroup>
        <MinimizeButton />
      </Container.Top>

      <Container.Body height={WINDOW_SIZE.BODY_SECTION_FOCUS_HEIGHT} padding="0 0 0 10px">
        <TaskNameBox>
          <TaskNameText>{currentTask?.taskName || 'Focus Time'}</TaskNameText>
        </TaskNameBox>
        <TimerWrapper>
          <TimerCompletion
            sessionCount={currentTask?.sessionCount || 1}
            onNewTask={handleNewTask}
            onRepeat={handleRepeat}
          />
        </TimerWrapper>
      </Container.Body>

      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        <CompletionActions onNewTask={handleNewTask} onRepeat={handleRepeat} />
      </Container.Bottom>
    </Container>
  )
}

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

const TaskNameBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 292px;
  height: 88px;
  background: rgba(187, 187, 187, 0.04);
  border-radius: 8px;
`

const TaskNameText = styled.div`
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  word-break: break-word;
  line-height: 20px;
`

const TimerWrapper = styled.div`
  width: 88px;
  display: flex;
  justify-content: center;
`
