import React, { useRef } from 'react'

import { CircleBackground, CircleProgress, Svg, TimerWrapper } from '../styled'
import theme from '@renderer/styles/theme'
import type { TimerStatus } from '@renderer/hooks/useCircularTimer'

export type TimerProps = {
  fullDuration: number
  setToastMessage: (message: string) => void
  strokeWidth?: number
  size?: number
  iconSize?: number
  currentDuration: number
  status: TimerStatus
  handleStatus: (status: TimerStatus) => void
  children: React.ReactNode
}

const CircularTimer: React.FC<TimerProps> = ({
  fullDuration,
  setToastMessage,
  strokeWidth = 4,
  size = 54,
  currentDuration,
  status,
  handleStatus,
  children
}) => {
  const radius = useRef((size - strokeWidth) / 2)
  const circumference = useRef(2 * Math.PI * radius.current)
  const progress = useRef((currentDuration / fullDuration) * circumference.current)

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
    <TimerWrapper $size={size} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {status !== 'end' && (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <CircleBackground
            cx={size / 2}
            cy={size / 2}
            r={radius.current}
            $strokeWidth={strokeWidth}
            $color={color[status].background}
          />
          <CircleProgress
            cx={size / 2}
            cy={size / 2}
            r={radius.current}
            $strokeWidth={strokeWidth}
            strokeDasharray={circumference.current}
            strokeDashoffset={circumference.current - progress.current}
            $color={color[status].progress}
          />
        </Svg>
      )}

      {children}
    </TimerWrapper>
  )
}

export default CircularTimer
