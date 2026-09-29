import { View } from 'react-native'
import Svg, { Circle, Line } from 'react-native-svg'
import { color } from '@/theme'

type Props = {
  /** 남은 비율 0~1. 1이면 원이 가득 차 있고 바늘은 12시를 가리킨다. */
  remaining: number
  paused?: boolean
  size?: number
  strokeWidth?: number
}

/** 데스크톱 CircularTimer와 같은 표현: 남은 만큼의 게이지와 게이지 끝을 가리키는 바늘. */
export function CircularTimer({ remaining, paused = false, size = 180, strokeWidth = 10 }: Props) {
  const r = (size - strokeWidth) / 2
  const c = size / 2
  const circumference = 2 * Math.PI * r
  const angle = ((-90 + remaining * 360) * Math.PI) / 180
  const hand = r * 0.6
  const stroke = paused ? color.paused : color.timer

  return (
    <View aria-hidden>
      <Svg width={size} height={size}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color.timerTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={(1 - remaining) * circumference}
          transform={`rotate(-90 ${c} ${c})`}
        />
        <Line
          x1={c}
          y1={c}
          x2={c + hand * Math.cos(angle)}
          y2={c + hand * Math.sin(angle)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  )
}
