import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import { useTimer } from './hooks/useTimer'
import { TIME, WINDOW_SIZE } from '@renderer/constants'
import TimerDisplay from './components/TimerDisplay'
import TimerCompletion from './components/TimerCompletion'
import CompletionActions from './components/CompletionActions'
import StopConfirmModal from './components/StopConfirmModal'
import Container from '@components/Container'
import MinimizeButton from '@components/MinimizeButton'
import Icon from '@renderer/component/Icon'

export function FocusPage(): JSX.Element {
  const navigate = useNavigate()
  const { currentTask, updateTask, resetCurrentTask, reStartTask, incrementSession } =
    useTaskContext()
  const [showStopModal, setShowStopModal] = useState(false)

  const {
    timerState,
    remainingTime,
    percentage,
    formatTime,
    handlePause,
    handleResume,
    handleStop
  } = useTimer(
    currentTask?.taskDuration || TIME.DEFAULT_POMODORO_DURATION,
    currentTask?.fullDuration || TIME.DEFAULT_POMODORO_DURATION,
    {
      onTick: (time, state) => {
        const taskStatus = state === 'pause' ? 'play' : state
        updateTask(time, taskStatus)
      }
    }
  )

  useEffect(() => {
    if (!currentTask?.taskName) {
      navigate('/')
    }
  }, [currentTask?.taskName, navigate])

  const handleStopClick = () => {
    setShowStopModal(true)
  }

  const handleStopConfirm = () => {
    handleStop()
    resetCurrentTask()
    setShowStopModal(false)
    navigate('/')
  }

  const handleStopCancel = () => {
    setShowStopModal(false)
  }

  const handleTinyWindowClick = () => {
    navigate('/tiny_window')
  }

  const handleNewTask = () => {
    resetCurrentTask()
    navigate('/')
  }

  const handleRepeat = () => {
    incrementSession()
    reStartTask()
  }

  const isCompleted = timerState === 'end'

  return (
    <Container>
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
          {isCompleted ? (
            <TimerCompletion
              sessionCount={currentTask?.sessionCount || 1}
              onNewTask={handleNewTask}
              onRepeat={handleRepeat}
            />
          ) : (
            <TimerDisplay
              percentage={percentage}
              formatTime={formatTime}
              remainingTime={remainingTime}
              timerState={timerState}
              onResume={handleResume}
              onPause={handlePause}
              onStop={handleStopClick}
            />
          )}
        </TimerWrapper>
      </Container.Body>
      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        {isCompleted ? (
          <CompletionActions onNewTask={handleNewTask} onRepeat={handleRepeat} />
        ) : (
          <Container.Button onClick={handleTinyWindowClick}>
            작은 창 보기
            <Icon name="icon_mini" alt="window_mini" size={16} />
          </Container.Button>
        )}
      </Container.Bottom>
      <StopConfirmModal
        isOpen={showStopModal}
        onClose={handleStopCancel}
        onConfirm={handleStopConfirm}
      />
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
