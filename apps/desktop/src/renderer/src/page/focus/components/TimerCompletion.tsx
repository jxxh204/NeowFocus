import Icon from '@renderer/component/ui/Icon'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import theme from '@renderer/styles/theme'

interface TimerCompletionProps {
  sessionCount: number
  onNewTask: () => void
  onRepeat: () => void
}

export default function TimerCompletion({ sessionCount }: TimerCompletionProps) {
  const { t } = useTranslation()

  const displayCount = sessionCount > 999 ? '999+' : sessionCount

  return (
    <Container>
      <TimerCircle>
        <Icon name="paw_white" size={28} />
      </TimerCircle>
      <SessionCount>
        {displayCount} {t('focus.sessionCount')}
      </SessionCount>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const TimerCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${theme.color.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
`

const SessionCount = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.color.text.muted};
  text-align: center;
`
