import { TimerText } from '../styled'
import type { TimerStatus } from '@renderer/hooks/useCircularTimer'
type Props = {
  size: number
  timeLeft: number
  status: TimerStatus
}

const StatusIdle = ({ size, timeLeft, status }: Props) => {
  if (status !== 'idle') return null
  const color = {
    progress: '#000000',
    progressBackground: '#e0e0e0',
    background: 'white'
  }
  return (
    <TimerText $size={size} $color={color.progress}>
      {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
    </TimerText>
  )
}

export default StatusIdle
