import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import useWindowSize from '@renderer/hooks/useWindowSize'
import { useTimer } from '../focus/hooks/useTimer'
import { TIME, WINDOW_SIZE, ROUTES } from '@renderer/constants'
import CircularTimer from '@renderer/component/CircularTimer'
import Icon from '@renderer/component/Icon'
import theme from '@renderer/styles/theme'

export function TinyWindowPage(): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currentTask, updateTask } = useTaskContext()
  const { setWindowSize } = useWindowSize()
  const textRef = useRef<HTMLDivElement>(null)

  // focus 페이지와 동일한 타이머 로직 사용
  const { percentage, timerState } = useTimer(
    currentTask?.taskDuration || TIME.DEFAULT_POMODORO_DURATION,
    currentTask?.fullDuration || TIME.DEFAULT_POMODORO_DURATION,
    {
      initialState: currentTask?.taskStatus || 'play',
      onTick: (time, state) => {
        // TimerState를 TaskStatus로 그대로 매핑 (pause도 유지)
        updateTask(time, state)

        // 타이머 종료 시 focus 페이지로 이동
        if (state === 'end') {
          navigate(ROUTES.FOCUS)
        }
      }
    }
  )

  useEffect(() => {
    setWindowSize({
      width: WINDOW_SIZE.TINY_WINDOW_WIDTH,
      height: WINDOW_SIZE.TINY_WINDOW_HEIGHT
    })
  }, [])

  const handleContainerClick = () => {
    navigate(ROUTES.FOCUS)
  }

  const isPaused = timerState === 'pause'

  if (process.env.NODE_ENV === 'development') {
    console.log('=== TinyWindow Debug ===')
    console.log('currentTask.taskStatus:', currentTask?.taskStatus)
    console.log('timerState:', timerState)
    console.log('isPaused:', isPaused)
    console.log('=======================')
  }

  return (
    <Container onClick={handleContainerClick}>
      <TaskNameArea>
        <TaskName ref={textRef}>{currentTask?.taskName || t('tinyWindow.defaultTaskName')}</TaskName>
      </TaskNameArea>
      <CircularTimer
        percentage={percentage}
        size={24}
        paused={isPaused}
        color="green"
        strokeWidth={3}
        handStrokeWidth={2}
      />
      <DragHandle>
        <Icon name="drag" size={36} />
      </DragHandle>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: ${WINDOW_SIZE.TINY_WINDOW_WIDTH}px;
  height: 36px;
  max-height: 36px;
  background: rgba(39, 39, 39, 0.9);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  overflow: hidden;
  -webkit-app-region: no-drag;
`

const TaskNameArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  padding: 8 12px;
  overflow: hidden;
  min-width: 0;
`

const TaskName = styled.div`
  color: ${theme.color.white};
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  -webkit-app-region: drag;
  cursor: grab;
  flex-shrink: 0;
`
