import Icon from '@renderer/component/Icon'
import BottomButton from '@renderer/component/Container/BottomButton'
import styled from 'styled-components'

interface CompletionActionsProps {
  onNewTask: () => void
  onRepeat: () => void
}

export default function CompletionActions({ onNewTask, onRepeat }: CompletionActionsProps) {
  return (
    <Container>
      <BottomButton onClick={onNewTask}>
        새 작업 <Icon name="plus_box" />
      </BottomButton>
      <BottomButton onClick={onRepeat}>
        타이머 한번 더 <Icon name="timer" />
      </BottomButton>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
`
