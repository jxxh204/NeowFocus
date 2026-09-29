import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Icon from '@renderer/component/ui/Icon'
import { SubButton } from '@renderer/component/ui/SubButton'
import { Typography } from '@renderer/component/ui/Typography'

interface ResumeTimerOverlayProps {
  timerState: 'idle' | 'play' | 'pause' | 'end'
  onResume?: () => void
}

/**
 * 일시정지된 타이머 위에 표시되는 "다시 시작" 버튼 오버레이
 * - pause 상태 + 호버 시 + 핸들러가 있을 때만 표시됨
 */
export default function ResumeTimerOverlay({ timerState, onResume }: ResumeTimerOverlayProps) {
  const { t } = useTranslation()

  // pause 상태 + 호버 시 + 핸들러가 있을 때만 표시
  const shouldShow = timerState === 'pause' && onResume

  if (!shouldShow) return null

  return (
    <Overlay>
      <SubButton onClick={onResume}>
        <Icon name="play" size={14} />
        <Typography variant="caption" color="#FFFFFF">
          {t('focus.timerMenu.resume')}
        </Typography>
      </SubButton>
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
