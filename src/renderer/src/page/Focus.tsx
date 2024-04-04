import Button from '@renderer/component/Button'
import CountDown from '@renderer/component/CountDown/CountDown'
import Header from '@renderer/component/Header'
import ScreenDrag from '@renderer/component/ScreenDrag/ScreenDrag'
import useScreenDrag from '@renderer/component/ScreenDrag/useScreenDrag'
import SkipButton from '@renderer/component/SkipButton'
import { useStorage, useTaskDispatchContext } from '@renderer/context/TaskContext'
import styled from 'styled-components'
import useCountDown from '../hooks/useCountDown'
import { useEffect } from 'react'
import AddTime from '@renderer/component/AddTime'
import { useNavigate } from 'react-router-dom'
import Complete from '@renderer/component/Modal/Complete'
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
const ModeChangeArea = styled.section`
  display: flex;
  flex-direction: row;
  width: 100%;
  cursor: pointer;
`

export function FocusDefault(): JSX.Element {
  const { storage } = useStorage()
  const { remainingTime, startCount, setTime } = useCountDown(storage.minute)
  const navigate = useNavigate()

  const onClickModeChange = () => {
    navigate('/focus_control')
  }

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ useEffect:')
    setTime()
    startCount()
    // window.message.receive('browser-window-focus', () => {
    //   console.log('browser-window-focus')

    // })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('browser-window-focus')
    }
  }, [])
  const { mouseMoveHandler, mouseUpHandler, mouseDownHandler } = useScreenDrag()
  //제거하기.
  return (
    <DefaultTaskWrap>
      <ModeChangeArea onClick={onClickModeChange}>
        <TaskName>{storage.taskName}</TaskName>
        <CountDown remainingTime={remainingTime} color={'black'} isMinutesTimer={true} />
      </ModeChangeArea>
      <ScreenDrag
        width={34}
        height={30}
        mouseMoveHandler={mouseMoveHandler}
        mouseUpHandler={mouseUpHandler}
        mouseDownHandler={mouseDownHandler}
      />
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
  gap: ${({ theme }) => theme.size.gap};
`

export function FocusControl() {
  const { storage } = useStorage()
  const navigate = useNavigate()
  const { dispatch } = useTaskDispatchContext()
  const { remainingTime, startCount, setTime, stopCount } = useCountDown(storage.minute)

  useEffect(() => {
    setTime()
    startCount()
    window.message.receive('browser-window-blur', () => {
      navigate('/focus')

      console.log('browser-window-blur', storage)
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('browser-window-blur')
    }
  }, [])
  const buttonHandler = () => {
    dispatch({ name: 'done', type: 'SET_TASK', value: true })
    stopCount()
  }

  return (
    <ControlTaskWrap>
      <Complete isOpen={storage.done} />
      <Header />
      <Body>
        <ControlTaskName>{storage.taskName}</ControlTaskName>
        <CountSection>
          <Button name="작업완료" onClick={buttonHandler} />
          {storage.done ? (
            <AddTime size={26} />
          ) : (
            <CountDown remainingTime={remainingTime} color={'black'} isMinutesTimer={true} />
          )}
        </CountSection>
        <SkipButton navi={'/'} name="prev" />
      </Body>
    </ControlTaskWrap>
  )
}
