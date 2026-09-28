import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import { useTimer } from './hooks/useTimer'
import { TIME, WINDOW_SIZE } from '@renderer/constants'
import TimerDisplay from './components/TimerDisplay'
import TaskNameDisplay from './components/TaskNameDisplay'
import StopConfirmModal from './components/StopConfirmModal'
import Container from '@components/Container'
import MinimizeButton from '@components/MinimizeButton'
import Icon from '@renderer/component/ui/Icon'

export default function FocusRunning(): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currentTask, updateTask, pastComplete, resetCurrentTask } = useTaskContext()
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
      initialState: currentTask?.taskStatus || 'play',
      onTick: (time, state) => {
        updateTask(time, state)
      }
    }
  )

  // 도메인 로직: 태스크 없으면 입력 페이지로
  useEffect(() => {
    if (!currentTask?.taskName) {
      navigate('/')
    }
  }, [currentTask?.taskName, navigate])

  // 키보드 이벤트: Enter 키로 작은 창으로 전환
  // 입력창에서의 Enter 이벤트 전파 방지를 위해 마운트 후 지연 활성화
  useEffect(() => {
    let isReady = false
    const timer = setTimeout(() => {
      isReady = true
    }, 300) // 300ms 후 Enter 키 활성화

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showStopModal && isReady) {
        navigate('/tiny_window')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showStopModal, navigate])

  // 이벤트 핸들러: 타이머 중지 확인
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

  // 이벤트 핸들러: 일시정지
  const handlePauseClick = () => {
    handlePause()
    updateTask(remainingTime, 'pause')
  }

  // 이벤트 핸들러: 재개
  const handleResumeClick = () => {
    handleResume()
    updateTask(remainingTime, 'play')
  }

  // 이벤트 핸들러: 빠른 완료 (진행된 시간만큼만 저장)
  const handleQuickComplete = () => {
    const fullDuration = currentTask?.fullDuration || TIME.DEFAULT_POMODORO_DURATION
    const elapsedTime = fullDuration - remainingTime
    handleStop()
    pastComplete(elapsedTime)
  }

  // 이벤트 핸들러: 작은 창으로 전환
  const handleTinyWindowClick = () => {
    navigate('/tiny_window')
  }

  return (
    <Container width={WINDOW_SIZE.DEFAULT_WIDTH}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
        <IconGroup>
          <Icon name="cat_face" alt="cat" size={24} />
          <Icon name="bubble" alt="bubble_focus" height={16} width={68} />
        </IconGroup>
        <MinimizeButton />
      </Container.Top>

      <Container.Body height={WINDOW_SIZE.BODY_SECTION_FOCUS_HEIGHT} padding="0 0 0 10px">
        <TaskNameDisplay
          taskName={currentTask?.taskName || t('focus.defaultTaskName')}
          onComplete={handleQuickComplete}
          onDelete={handleStopClick}
        />
        <TimerDisplay
          percentage={percentage}
          formatTime={formatTime}
          remainingTime={remainingTime}
          timerState={timerState}
          onResume={handleResumeClick}
          onPause={handlePauseClick}
        />
      </Container.Body>

      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        <Container.Button onClick={handleTinyWindowClick}>
          {t('focus.tinyWindowButton')}
          <Icon name="icon_mini" alt="window_mini" size={16} />
        </Container.Button>
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
