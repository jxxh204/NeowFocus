import React from 'react'
import PauseIcon from '@assets/timer_pause.svg'
import PlayIcon from '@assets/timer_play.svg'

import {
  CircleBackground,
  CircleProgress,
  PauseWrap,
  PlayWrap,
  Svg,
  TimerText,
  TimerWrapper
} from './styled'
import theme from '@renderer/styles/theme'
import type { StateType } from '@renderer/hooks/useCircularTimer'

export type TimerProps = {
  duration: number
  setToastMessage: (message: string) => void
  initialTime?: number
  strokeWidth?: number
  size?: number
  iconSize?: number
  timeLeft: number
  status: StateType
  handleStatus: (status: StateType) => void
}

const CircularTimer: React.FC<TimerProps> = ({
  duration,
  setToastMessage,
  strokeWidth = 4,
  size = 54,
  iconSize = 24,
  timeLeft,
  status,
  handleStatus
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / duration) * circumference

  const color = {
    idle: {
      progress: '#000000',
      progressBackground: '#e0e0e0',
      background: 'white'
    },
    pause: {
      progress: 'black',
      background: theme.color.primary[300],
      progressBackground: theme.color.primary[300]
    },
    play: {
      progress: 'black',
      background: '#e0e0e0',
      progressBackground: '#e0e0e0'
    },
    end: {
      progress: 'white',
      background: theme.color.primary[500],
      progressBackground: 'white'
    }
  }
  // TODO : event handler를 hooks로 분리하기.
  const handleClick = () => {
    if (status === 'pause') {
      handleStatus('play')
      setToastMessage('타이머 재개')
    } else {
      handleStatus('pause')
      setToastMessage('타이머 일시정지')
    }
  }
  const handleMouseEnter = () => {
    if (status === 'idle') {
      handleStatus('pause')
      setToastMessage('타이머 일시정지')
    }
    if (status === 'play') {
      setToastMessage('타이머 재개')
    }
  }
  const handleMouseLeave = () => {
    if (status === 'pause') {
      handleStatus('idle')
    }
    setToastMessage('')
  }
  return (
    <TimerWrapper
      $size={size}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {status !== 'end' && (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <CircleBackground
            cx={size / 2}
            cy={size / 2}
            r={radius}
            $strokeWidth={strokeWidth}
            $color={color[status].background}
          />
          <CircleProgress
            cx={size / 2}
            cy={size / 2}
            r={radius}
            $strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            $color={color[status].progress}
          />
        </Svg>
      )}

      <>
        {status === 'idle' && (
          <TimerText $size={size} $color={color[status].progress}>
            {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
          </TimerText>
        )}
        {status === 'play' && (
          <PlayWrap $size={size} $iconSize={iconSize} onClick={handleClick}>
            <PlayIcon />
          </PlayWrap>
        )}
        {status === 'pause' && (
          <PauseWrap $size={size} $iconSize={iconSize} onClick={handleClick}>
            <PauseIcon />
          </PauseWrap>
        )}
      </>
    </TimerWrapper>
  )
}

export default CircularTimer
