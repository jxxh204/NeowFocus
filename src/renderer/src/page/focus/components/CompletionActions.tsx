import { useTranslation } from 'react-i18next'
import Icon from '@renderer/component/ui/Icon'
import BottomButton from '@renderer/component/Container/BottomButton'
import styled from 'styled-components'

interface CompletionActionsProps {
  onNewTask: () => void
  onRepeat: () => void
}

export default function CompletionActions({ onNewTask, onRepeat }: CompletionActionsProps) {
  const { t } = useTranslation()

  return (
    <Container>
      <BottomButton onClick={onNewTask}>
        {t('focus.completionActions.newTask')} <Icon name="plus_box" />
      </BottomButton>
      <BottomButton onClick={onRepeat}>
        {t('focus.completionActions.repeat')} <Icon name="timer" />
      </BottomButton>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
`
