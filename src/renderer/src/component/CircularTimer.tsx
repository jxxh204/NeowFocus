import styled from 'styled-components'
import { useSettingsContext, THEME_COLORS } from '@renderer/context/SettingsContext'

interface CircularTimerProps {
  percentage: number
  size?: number
  paused?: boolean
  color?: 'white' | 'green' | 'theme'
  strokeWidth?: number
  handStrokeWidth?: number
}

export default function CircularTimer({
  percentage,
  size = 64,
  paused = false,
  color = 'white',
  strokeWidth = 6,
  handStrokeWidth = 6
}: CircularTimerProps) {
  const { settings } = useSettingsContext()
  const themeColor = color === 'theme' ? THEME_COLORS[settings.themeColor] : undefined
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // 흰줄이 줄어들어야 함: percentage가 증가하면 offset이 감소 (남은 부분만 표시)
  const offset = ((100 - percentage) / 100) * circumference

  // 시계바늘 각도 계산 (게이지 끝점과 일치하도록)
  // 게이지는 12시 방향(-90도)에서 시작하여 시계방향으로 진행
  // percentage가 100이면 12시, 0이면 한바퀴 돌아서 12시
  const angle = -90 + (percentage / 100) * 360
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
        $color={color}
        $themeColor={themeColor}
      />
      {/* 시계바늘 */}
      <ClockHand
        x1={centerX}
        y1={centerY}
        x2={handEndX}
        y2={handEndY}
        strokeWidth={handStrokeWidth}
        strokeLinecap="round"
        $paused={paused}
        $color={color}
        $themeColor={themeColor}
      />
    </svg>
  )
}

const Circle = styled.circle`
  stroke: ${({ theme }) => theme.color.Timer.background};
`

const ProgressCircle = styled.circle<{
  $paused: boolean
  $color: 'white' | 'green' | 'theme'
  $themeColor?: string
}>`
  stroke: ${({ theme, $paused, $color, $themeColor }) => {
    if ($paused) return theme.color.Timer.paused
    if ($color === 'theme' && $themeColor) return $themeColor
    return $color === 'green' ? theme.color.primary[500] : theme.color.Timer.progress
  }};
  transition:
    stroke-dashoffset 0.3s ease,
    stroke 0.3s ease;
`

const ClockHand = styled.line<{
  $paused: boolean
  $color: 'white' | 'green' | 'theme'
  $themeColor?: string
}>`
  stroke: ${({ theme, $paused, $color, $themeColor }) => {
    if ($paused) return theme.color.Timer.paused
    if ($color === 'theme' && $themeColor) return $themeColor
    return $color === 'green' ? theme.color.primary[500] : theme.color.Timer.progress
  }};
  transition: stroke 0.3s ease;
`
