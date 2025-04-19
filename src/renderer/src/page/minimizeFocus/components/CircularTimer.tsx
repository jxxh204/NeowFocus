import React from 'react'

import { CircleBackground, CircleProgress, Svg, TimerWrapper } from './styled'
import { IconWrapper } from '../styled'
import PawGraySvg from '@assets/paw_gray.svg'

export type TimerProps = {
  strokeWidth?: number
  size?: number
  bgColor?: string
  progressColor?: string
  iconSize?: number
  fullDuration?: number
  timeLeft?: number
}

const CircularTimer: React.FC<TimerProps> = ({
  strokeWidth = 4,
  size = 54,
  bgColor = 'none',
  progressColor = 'black',
  fullDuration = 1600,
  timeLeft = 1600
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / fullDuration) * circumference

  const calculatePercentage = (initialTime: number, duration: number) => {
    return ((duration - initialTime) / duration) * 100
  }

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
      <IconWrapper size={16} percentage={calculatePercentage(timeLeft, fullDuration)}>
        <PawGraySvg />
      </IconWrapper>
    </TimerWrapper>
  )
}

export default CircularTimer
