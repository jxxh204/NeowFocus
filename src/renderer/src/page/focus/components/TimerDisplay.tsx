import { useState } from 'react'
import styled from 'styled-components'
import CircularTimer from '@renderer/component/CircularTimer'
import Icon from '@renderer/component/Icon'
import TimerMenu from './TimerMenu'

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
  const shouldShowMenu = isPlaying && isHovering

  return (
    <TimerWrapper
      onClick={handleTimerClick}
      $clickable={isPaused}
      onMouseEnter={() => isPlaying && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <TimerCircleWrapper>
        <CircularTimer percentage={percentage} size={64} paused={isPaused} />

        {isPaused && (
          <PauseOverlay>
            <PlayButton>
              <Icon name="play" size={14} />
              <PlayLabel>재개</PlayLabel>
            </PlayButton>
          </PauseOverlay>
        )}

        {shouldShowMenu && onPause && onStop && (
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
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
`

const PlayButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
`

const PlayLabel = styled.span`
  font-size: 10px;
  color: #ffffff;
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
  color: #858585;
  text-align: center;
  line-height: 20px;
`
