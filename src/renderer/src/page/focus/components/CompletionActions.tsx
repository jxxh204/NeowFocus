import styled from 'styled-components'

interface CompletionActionsProps {
  onNewTask: () => void
  onRepeat: () => void
}

export default function CompletionActions({ onNewTask, onRepeat }: CompletionActionsProps) {
  return (
    <Container>
      <ActionButton onClick={onNewTask}>새 작업</ActionButton>
      <Divider />
      <ActionButton onClick={onRepeat}>타이머 한번 더</ActionButton>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const ActionButton = styled.button`
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`

const Divider = styled.div`
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
`
