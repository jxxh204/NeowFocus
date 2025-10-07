import { useState } from 'react'
import styled from 'styled-components'
import CircularTimer from '@renderer/component/CircularTimer'
import Icon from '@renderer/component/Icon'
import TimerMenu from './TimerMenu'
import theme from '@renderer/styles/theme'

interface TimerDisplayProps {
  percentage: number
  formatTime: (time: number) => string
  remainingTime: number
  timerState: 'idle' | 'play' | 'pause' | 'end'
  onResume?: () => void
  onPause?: () => void
  onStop?: () => void
}

export default function TimerDisplay({
  percentage,
  formatTime,
  remainingTime,
  timerState,
  onResume,
  onPause,
  onStop
}: TimerDisplayProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleTimerClick = () => {
    if (timerState === 'pause' && onResume) {
      onResume()
    }
  }

  const isPaused = timerState === 'pause'
  const isPlaying = timerState === 'play'
  const shouldShowPlayMenu = isPaused && isHovering
  const shouldShowPauseMenu = isPlaying && isHovering

  return (
    <TimerWrapper
      onClick={handleTimerClick}
      $clickable={isPaused}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <TimerCircleWrapper>
        <CircularTimer percentage={percentage} size={64} paused={isPaused} />

        {shouldShowPlayMenu && (
          <PauseOverlay>
            <PlayButton>
              <Icon name="play" size={14} />
              <PlayLabel>재개</PlayLabel>
            </PlayButton>
          </PauseOverlay>
        )}

        {shouldShowPauseMenu && onPause && onStop && (
          <MenuOverlay>
            <TimerMenu onPause={onPause} onStop={onStop} />
          </MenuOverlay>
        )}
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

const PauseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`

const PlayButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 24px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  border-radius: 8px;
`

const PlayLabel = styled.span`
  font-size: 10px;
  font-weight: 400;
  line-height: 14px;
  color: ${theme.color.white};
`

const MenuOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
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
