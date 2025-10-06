import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import useWindowSize from '@renderer/hooks/useWindowSize'
import { useTimer } from '../focus/hooks/useTimer'
import { TIME, WINDOW_SIZE, ROUTES } from '@renderer/constants'
import CircularTimer from '@renderer/component/CircularTimer'
import Icon from '@renderer/component/Icon'

export function TinyWindowPage(): JSX.Element {
  const navigate = useNavigate()
  const { currentTask, updateTask } = useTaskContext()
  const { setWindowSize } = useWindowSize()
  const textRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  // focus 페이지와 동일한 타이머 로직 사용
  const { percentage, timerState } = useTimer(
    currentTask?.taskDuration || TIME.DEFAULT_POMODORO_DURATION,
    currentTask?.fullDuration || TIME.DEFAULT_POMODORO_DURATION,
    {
      onTick: (time, state) => {
        // TimerState를 TaskStatus로 매핑 (pause는 play로 처리)
        const taskStatus = state === 'pause' ? 'play' : state
        updateTask(time, taskStatus)

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

  useEffect(() => {
    if (textRef.current) {
      const isOverflow = textRef.current.scrollWidth > textRef.current.clientWidth
      setIsTruncated(isOverflow)
    }
  }, [currentTask?.taskName])

  const handleContainerClick = () => {
    navigate(ROUTES.FOCUS)
  }

  const isPaused = timerState === 'pause'

  return (
    <Container onClick={handleContainerClick}>
      <TaskNameArea $centered={!isTruncated}>
        <TaskName ref={textRef}>{currentTask?.taskName || 'Focus Time'}</TaskName>
      </TaskNameArea>
      <TimerArea>
        <CircularTimer percentage={percentage} size={36} paused={isPaused} />
      </TimerArea>
      <Icon name="drag" size={36} />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: ${WINDOW_SIZE.TINY_WINDOW_WIDTH}px;
  height: ${WINDOW_SIZE.TINY_WINDOW_HEIGHT}px;
  background: ${({ theme }) => theme.color.container.background};
  border: 1px solid ${({ theme }) => theme.color.container.border};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`

const TaskNameArea = styled.div<{ $centered: boolean }>`
  width: ${WINDOW_SIZE.TINY_TASK_NAME_WIDTH}px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
  cursor: pointer;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const TaskName = styled.div`
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: ${WINDOW_SIZE.TINY_TASK_NAME_TEXT_WIDTH}px;
`

const TimerArea = styled.div`
  width: ${WINDOW_SIZE.TINY_TIMER_CONTAINER_SIZE}px;
  height: ${WINDOW_SIZE.TINY_TIMER_CONTAINER_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`
