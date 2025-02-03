import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStorage, useTaskDispatchContext } from '@renderer/context/TaskContext'
import { ControlTaskWrap, Body, ControlTaskName, CountSection } from './styled'
import CompleteModal from '@renderer/component/Modal/CompleteModal'
import useWindowSize from '../../hooks/useWindowSize'
import Button from '@renderer/component/Button'
import Header from '@renderer/component/Header'
import CountDown from '@renderer/component/CountDown/CountDown'

const MiniMizeFocus = () => {
  const { storage } = useStorage()
  const navigate = useNavigate()
  const { dispatch } = useTaskDispatchContext()
  const { setWindowSize } = useWindowSize()

  useEffect(() => {
    // if (!storage.done) {
    // CompleteModal이 계속 생겨서 적용.
    setWindowSize({ windowName: 'focus' })
    window.message.receive('browser-window-blur', () => {
      navigate('/focus')
    })
    // }

    return () => {
      window.electron.ipcRenderer.removeAllListeners('browser-window-blur')
    }
  }, [storage.done])

  const onClickCompleteHandler = () => {
    dispatch({ name: 'done', type: 'SET_TASK', value: true })
  }

  return (
    <ControlTaskWrap>
      <CompleteModal isOpen={storage.done} />
      <Header />
      <Body>
        <ControlTaskName>{storage.taskName}</ControlTaskName>
        <CountSection>
          <Button name="작업완료" onClick={onClickCompleteHandler} />
          <CountDown minute={storage.minute} color={'black'} done={storage.done} />
        </CountSection>
        {/* <SkipButton navi={'/'} name="prev" /> */}
      </Body>
    </ControlTaskWrap>
  )
}

export default MiniMizeFocus
