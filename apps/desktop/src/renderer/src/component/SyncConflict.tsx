import styled from 'styled-components'
import { remainingOf } from '@neowfocus/core'
import Container from './Container'
import { WINDOW_SIZE } from '@renderer/constants'
import { useTaskContext } from '@renderer/context/TaskContext'
import Icon from './ui/Icon'
import MinimizeButton from './MinimizeButton'

const Content = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px 22px 24px;
  box-sizing: border-box;
  overflow-y: auto;
  h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px;
  }
  p,
  small {
    color: #b5b8b5;
    font-size: 12px;
    line-height: 1.6;
  }
`
const Choice = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: 0;
  border-bottom: 1px solid #ffffff12;
  padding: 16px 0;
  background: none;
  color: white;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  small {
    display: block;
    margin-top: 5px;
  }
  &:focus-visible {
    outline: 2px solid white;
  }
`
export default function SyncConflict() {
  const { focusState, resolveConflict } = useTaskContext()
  const candidates = focusState.conflicts ?? []
  const deviceId = localStorage.getItem('deviceId')
  return (
    <Container width={WINDOW_SIZE.DEFAULT_WIDTH}>
      <Container.Top height={30}>
        <Icon name="cat_face" alt="cat" size={20} />
        <MinimizeButton />
      </Container.Top>
      <Container.Body height={Math.min(600, 120 + candidates.length * 88)} padding="0">
        <Content>
          <h1>어떤 집중을 이어갈까요?</h1>
          {candidates.map((session) => (
            <Choice type="button" key={session.id} onClick={() => resolveConflict(session.id)}>
              <span>
                {session.task}
                <small>
                  {(session.startedBy ?? session.updatedBy) === deviceId ? '이 Mac' : '다른 기기'} ·{' '}
                  {Math.ceil(remainingOf(session, Date.now()) / 60000)}분 남음
                </small>
              </span>
              <span aria-hidden="true">›</span>
            </Choice>
          ))}
          <p>다른 집중도 기록에 남아요.</p>
        </Content>
      </Container.Body>
    </Container>
  )
}
