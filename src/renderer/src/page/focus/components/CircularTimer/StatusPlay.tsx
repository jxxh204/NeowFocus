import styled from 'styled-components'
import { SvgWrap } from '../styled'
import PlayIcon from '@assets/timer_play.svg'
import type { TimerStatus } from '@renderer/hooks/useCircularTimer'
type Props = {
  size: number
  iconSize: number
  status: TimerStatus
  handleClick: () => void
}

const StatusPlay = ({ size, iconSize, status, handleClick }: Props) => {
  if (status !== 'play') return null
  return (
    <PlayWrap $size={size} $iconSize={iconSize} onClick={handleClick}>
      <PlayIcon />
    </PlayWrap>
  )
}

const PlayWrap = styled(SvgWrap)<{ $size: number; $iconSize: number }>`
  background-color: #e0e0e0;
`

export default StatusPlay
