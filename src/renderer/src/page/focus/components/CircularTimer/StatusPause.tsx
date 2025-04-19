import styled from 'styled-components'
import { SvgWrap } from '../styled'
import PauseIcon from '@assets/timer_pause.svg'
import type { TimerStatus } from '@renderer/hooks/useCircularTimer'

type Props = {
  size: number
  iconSize: number
  status: TimerStatus
  handleClick: () => void
}

const StatusPause = ({ size, iconSize, status, handleClick }: Props) => {
  if (status !== 'pause') return null
  return (
    <PauseWrap $size={size} $iconSize={iconSize} onClick={handleClick}>
      <PauseIcon />
    </PauseWrap>
  )
}

const PauseWrap = styled(SvgWrap)<{ $size: number; $iconSize: number }>`
  background-color: ${({ theme }) => theme.color.primary[300]};
`
export default StatusPause
