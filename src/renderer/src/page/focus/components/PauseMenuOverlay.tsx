import styled from 'styled-components'
import TimerMenu from './TimerMenu'

interface PauseMenuOverlayProps {
  timerState: 'idle' | 'play' | 'pause' | 'end'
  isHovering: boolean
  onPause?: () => void
  onStop?: () => void
}

/**
 * 실행 중인 타이머 위에 표시되는 일시정지/중단 메뉴 오버레이
 * - play 상태 + 호버 시에만 표시됨
 */
export default function PauseMenuOverlay({
  timerState,
  isHovering,
  onPause,
  onStop
}: PauseMenuOverlayProps) {
  // play 상태 + 호버 시 + 핸들러가 있을 때만 표시
  const shouldShow = timerState === 'play' && isHovering && onPause && onStop

  if (!shouldShow) return null

  return (
    <Overlay>
      <TimerMenu onPause={onPause} onStop={onStop} />
    </Overlay>
  )
}

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`
