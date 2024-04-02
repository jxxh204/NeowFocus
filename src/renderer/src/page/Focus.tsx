import Button from '@renderer/component/Button'
import CountDown from '@renderer/component/CountDown/CountDown'
import Header from '@renderer/component/Header'
import ScreenDrag from '@renderer/component/ScreenDrag/ScreenDrag'
import useScreenDrag from '@renderer/component/ScreenDrag/useScreenDrag'
import SkipButton from '@renderer/component/SkipButton'
import { useStorage } from '@renderer/context/TaskContext'
import { useEffect } from 'react'
import styled from 'styled-components'
const DefaultTaskWrap = styled.article`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.size.gap};
`

const TaskName = styled.div`
  border-radius: ${({ theme }) => theme.border.radius};
  border: 1px solid ${({ theme }) => theme.border.color};
  background: #272727;
  color: white;
  padding: 12px 8px;
  width: 100%;
`

export function FocusDefault(): JSX.Element {
  const { storage } = useStorage()
  const { mouseMoveHandler, mouseUpHandler, mouseDownHandler } = useScreenDrag()
  return (
    <DefaultTaskWrap>
      <TaskName>{storage.taskName}</TaskName>
      <CountDown countMinutes={storage.timer} color={'black'} isMinutesTimer={true} />
      <ScreenDrag
        width={34}
        height={30}
        mouseMoveHandler={mouseMoveHandler}
        mouseUpHandler={mouseUpHandler}
        mouseDownHandler={mouseDownHandler}
      />
      <SkipButton navi={'complete'} />
    </DefaultTaskWrap>
  )
}

const ControlTaskWrap = styled.article`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: end;

  gap: ${({ theme }) => theme.size.gap};
`
const Body = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.size.gap};
`

const ControlTaskName = styled.div`
  border-radius: ${({ theme }) => theme.border.radius};
  border: 1px solid ${({ theme }) => theme.border.color};
  background: #272727;
  color: white;
  padding: 12px 8px;
`
const CountSection = styled.section`
  display: flex;
  flex-direction: row;
`

export function FocusControl() {
  const { storage } = useStorage()
  const buttonHandler = () => {}
  useEffect(() => {
    console.log(storage.minute)
  }, [storage.minute])
  return (
    <ControlTaskWrap>
      <Header />
      <Body>
        <ControlTaskName>{storage.taskName}</ControlTaskName>
        <CountSection>
          <Button name="작업완료" onClick={buttonHandler} />
          <CountDown countMinutes={storage.timer} color={'black'} isMinutesTimer={true} />
        </CountSection>
      </Body>
    </ControlTaskWrap>
  )
}
