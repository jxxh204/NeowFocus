import styled from 'styled-components'

interface CircularTimerProps {
  percentage: number
  size?: number
  paused?: boolean
}

export default function CircularTimer({ percentage, size = 240, paused = false }: CircularTimerProps) {
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const strokeWidth = size < 50 ? 3 : 8

  return (
    <svg width={size} height={size}>
      {/* 배경 원 */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* 진행 원 */}
      <ProgressCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        $paused={paused}
      />
    </svg>
  )
}

const Circle = styled.circle`
  stroke: ${({ theme }) => theme.color.Timer.background};
`

const ProgressCircle = styled.circle<{ $paused: boolean }>`
  stroke: ${({ theme, $paused }) => ($paused ? '#8C8C8C' : theme.color.Timer.progress)};
  transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
`
