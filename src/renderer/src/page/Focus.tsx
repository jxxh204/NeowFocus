import Button from '@renderer/component/Button'
import CountDown from '@renderer/component/CountDown/CountDown'
import Header from '@renderer/component/Header'
import ScreenDrag from '@renderer/component/ScreenDrag/ScreenDrag'
import useScreenDrag from '@renderer/component/ScreenDrag/useScreenDrag'
import { useStorage, useTaskDispatchContext } from '@renderer/context/TaskContext'
import styled from 'styled-components'
import useCountDown from '../hooks/useCountDown'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CompleteModal from '@renderer/component/Modal/CompleteModal'
import useWindowSize from '../hooks/useWindowSize'
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
  const { remainingTime, startCount } = useCountDown(storage.minute)
  const navigate = useNavigate()
  const { setWindowSize } = useWindowSize()
  const { mouseMoveHandler, mouseUpHandler, mouseDownHandler } = useScreenDrag()

  const onClickModeChange = () => {
    navigate('/focus_control')
  }

  useEffect(() => {
    startCount()
    setWindowSize({ windowName: 'default-focus' })
    // window.message.receive('browser-window-focus', () => {
    //   console.log('browser-window-focus')

    // })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('browser-window-focus')
    }
  }, [storage.done])

  //제거하기.
  return (
    <DefaultTaskWrap>
      <ModeChangeArea onClick={onClickModeChange}>
        <TaskName>{storage.taskName}</TaskName>
        <CountDown
          remainingTime={remainingTime}
          color={'black'}
          done={storage.done}
          doneText="타이머 완료"
        />
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
  const { remainingTime, startCount, stopCount } = useCountDown(storage.minute)
  const { setWindowSize } = useWindowSize()

  useEffect(() => {
    // if (!storage.done) {
    // CompleteModal이 계속 생겨서 적용.
    setWindowSize({ windowName: 'focus' })
    startCount()
    window.message.receive('browser-window-blur', () => {
      navigate('/focus')
    })
    // }

    return () => {
      window.electron.ipcRenderer.removeAllListeners('browser-window-blur')
    }
  }, [storage.done])

  const onClickCompleteHandler = () => {
    dispatch({ type: 'INIT_TASK' }) //완전 끝나고 처음으로 돌아갈 시.
    dispatch({ name: 'done', type: 'SET_TASK', value: true })
    stopCount()
  }

  return (
    <ControlTaskWrap>
      <CompleteModal isOpen={storage.done} />
      <Header />
      <Body>
        <ControlTaskName>{storage.taskName}</ControlTaskName>
        <CountSection>
          <Button name="작업완료" onClick={onClickCompleteHandler} />
          <CountDown remainingTime={remainingTime} color={'black'} done={storage.done} />
        </CountSection>
        {/* <SkipButton navi={'/'} name="prev" /> */}
      </Body>
    </ControlTaskWrap>
  )
}
