import React from 'react'
import styled from 'styled-components'

interface CircularProgressProps {
  size: number
  strokeWidth: number
  percentage: number
  color?: string
  children: React.ReactNode
}

const CircleWrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
`

const CircleSVG = styled.svg``

const CircleBackground = styled.circle<{ strokeWidth: number }>`
  fill: none;
  stroke: #f0f0f0;
  stroke-width: ${(props) => props.strokeWidth}px;
`

const CircleProgress = styled.circle<{
  strokeWidth: number
  circumference: number
  offset: number
}>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: ${(props) => props.strokeWidth}px;
  stroke-dasharray: ${(props) => props.circumference};
  stroke-dashoffset: ${(props) => props.offset};
  transition: stroke-dashoffset 0.3s;
`

const Time = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
`

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  percentage,
  color,
  children
}) => {
  const radius = size / 2
  const circumference = ((3 * Math.PI) / 2) * radius
  console.log('🚀 ~ circumference:', percentage, circumference)
  const offset = (percentage / 100) * circumference

  return (
    <CircleWrapper size={size}>
      <CircleSVG>
        <CircleBackground
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth}
          strokeWidth={strokeWidth}
        />
        <CircleProgress
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth}
          circumference={circumference}
          offset={offset}
          strokeWidth={strokeWidth}
          color={color ? color : '#3498db'}
        />
      </CircleSVG>
      <Time>{children}</Time>
    </CircleWrapper>
  )
}

export default CircularProgress
