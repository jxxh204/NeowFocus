import React from 'react'

import { CircleBackground, CircleProgress, Svg, TimerWrapper } from './styled'
import useCircularTimer from '@renderer/hooks/useCircularTimer'

export type TimerProps = {
  children: React.ReactNode
  duration: number
  initialTime?: number
  strokeWidth?: number
  size?: number
  bgColor?: string
  progressColor?: string
  iconSize?: number
}

const CircularTimer: React.FC<TimerProps> = ({
  children,
  duration,
  initialTime = duration,
  strokeWidth = 4,
  size = 54,
  bgColor = 'none',
  progressColor = 'black'
}) => {
  const { timeLeft } = useCircularTimer({ duration, initialTime })

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / duration) * circumference

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
