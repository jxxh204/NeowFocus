import React, { useEffect } from 'react'

import { CircleBackground, CircleProgress, Svg, TimerWrapper } from './styled'
import useCircularTimer from '@renderer/hooks/useCircularTimer'
import useWindowSize from '@renderer/hooks/useWindowSize'

export type TimerProps = {
  children: React.ReactNode
  strokeWidth?: number
  size?: number
  bgColor?: string
  progressColor?: string
  iconSize?: number
}

const CircularTimer: React.FC<TimerProps> = ({
  children,
  strokeWidth = 4,
  size = 54,
  bgColor = 'none',
  progressColor = 'black'
}) => {
  const { timeLeft, fullTime, status } = useCircularTimer()
  const { setWindowSize } = useWindowSize()
  useEffect(() => {
    if (status === 'end') {
      setWindowSize({ windowName: 'focus' })
    }
  }, [status])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / fullTime) * circumference

  return (
    <TimerWrapper size={size}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <CircleBackground
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          color={bgColor}
        />
        <CircleProgress
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          color={progressColor}
        />
      </Svg>
      {children}
    </TimerWrapper>
  )
}

export default CircularTimer
