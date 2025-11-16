import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Icon from '@renderer/component/Icon'
import theme from '@renderer/styles/theme'

interface ResumeTimerOverlayProps {
  timerState: 'idle' | 'play' | 'pause' | 'end'
  isHovering: boolean
}

/**
 * 일시정지된 타이머 위에 표시되는 "다시 시작" 버튼 오버레이
 * - pause 상태 + 호버 시에만 표시됨
 */
export default function ResumeTimerOverlay({ timerState, isHovering }: ResumeTimerOverlayProps) {
  const { t } = useTranslation()

  // pause 상태 + 호버 시에만 표시
  const shouldShow = timerState === 'pause' && isHovering

  if (!shouldShow) return null

  return (
    <Overlay>
      <ResumeButton>
        <Icon name="play" size={14} />
        <Label>{t('focus.timerMenu.resume')}</Label>
      </ResumeButton>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`

const ResumeButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 24px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  border-radius: 8px;
`

const Label = styled.span`
  font-size: 10px;
  font-weight: 400;
  line-height: 14px;
  color: ${theme.color.white};
`
