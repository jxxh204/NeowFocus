import styled from 'styled-components'

interface CircularTimerProps {
  percentage: number
  size?: number
  paused?: boolean
}

export default function CircularTimer({
  percentage,
  size = 64,
  paused = false
}: CircularTimerProps) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // 흰줄이 줄어들어야 함: percentage가 증가하면 offset이 감소 (남은 부분만 표시)
  const offset = ((100 - percentage) / 100) * circumference

  // 시계바늘 각도 계산 (반시계방향으로 회전)
  const angle = -90 - ((100 - percentage) / 100) * 360 // 오른쪽에서 왼쪽으로
  const centerX = size / 2
  const centerY = size / 2
  const handLength = radius * 0.6 // 반지름의 60% 길이

  // 시계바늘 끝점 계산
  const handEndX = centerX + handLength * Math.cos((angle * Math.PI) / 180)
  const handEndY = centerY + handLength * Math.sin((angle * Math.PI) / 180)

  return (
    <svg width={size} height={size}>
      {/* 배경 원 */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {/* 진행 원 */}
      <ProgressCircle
        cx={centerX}
        cy={centerY}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${centerX} ${centerY})`}
        $paused={paused}
      />
      {/* 시계바늘 */}
      <ClockHand
        x1={centerX}
        y1={centerY}
        x2={handEndX}
        y2={handEndY}
        strokeWidth={6}
        strokeLinecap="round"
        $paused={paused}
      />
    </svg>
  )
}

const Circle = styled.circle`
  stroke: ${({ theme }) => theme.color.Timer.background};
`

const ProgressCircle = styled.circle<{ $paused: boolean }>`
  stroke: ${({ theme, $paused }) => ($paused ? theme.color.Timer.paused : theme.color.Timer.progress)};
  transition:
    stroke-dashoffset 0.3s ease,
    stroke 0.3s ease;
`

const ClockHand = styled.line<{ $paused: boolean }>`
  stroke: ${({ theme, $paused }) => ($paused ? theme.color.Timer.paused : theme.color.Timer.progress)};
  transition: stroke 0.3s ease;
`
