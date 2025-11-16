import { useState } from 'react'
import styled from 'styled-components'
import CircularTimer from '@renderer/component/CircularTimer'
import ResumeTimerOverlay from './ResumeTimerOverlay'
import PauseMenuOverlay from './PauseMenuOverlay'
import theme from '@renderer/styles/theme'

interface TimerDisplayProps {
  percentage: number
  formatTime: (time: number) => string
  remainingTime: number
  timerState: 'idle' | 'play' | 'pause' | 'end'
  onResume?: () => void
  onPause?: () => void
}

export default function TimerDisplay({
  percentage,
  formatTime,
  remainingTime,
  timerState,
  onResume,
  onPause
}: TimerDisplayProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleTimerClick = () => {
    if (timerState === 'pause' && onResume) {
      onResume()
    }
  }

  const isPaused = timerState === 'pause'

  return (
    <TimerWrapper
      onClick={handleTimerClick}
      $clickable={isPaused}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <TimerCircleWrapper>
        <CircularTimer percentage={percentage} size={64} paused={isPaused} />
        <ResumeTimerOverlay timerState={timerState} onResume={onResume} />
        <PauseMenuOverlay timerState={timerState} isHovering={isHovering} onPause={onPause} />
      </TimerCircleWrapper>
      <TimeText>{formatTime(remainingTime)}</TimeText>
    </TimerWrapper>
  )
}

const TimerWrapper = styled.div<{ $clickable: boolean }>`
  position: relative;
  width: 80px;
  height: 88px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`

const TimerCircleWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 0;
  width: 64px;
  height: 64px;
`

const TimeText = styled.div`
  position: absolute;
  left: 23.5px;
  top: 68px;
  width: 33px;
  height: 20px;
  font-size: 12px;
  font-weight: 500;
  color: ${theme.color.white};
  text-align: center;
  line-height: 20px;
`
