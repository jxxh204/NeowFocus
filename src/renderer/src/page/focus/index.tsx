import CountDown from '@renderer/component/CountDown/CountDown'
import ScreenDrag from '@renderer/component/ScreenDrag/ScreenDrag'
import useScreenDrag from '@renderer/component/ScreenDrag/useScreenDrag'
import { useStorage } from '@renderer/context/TaskContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useWindowSize from '../../hooks/useWindowSize'
import { DefaultTaskWrap, TaskName, ModeChangeArea } from './styled'

export function FocusDefault(): JSX.Element {
  const { storage } = useStorage()
  const navigate = useNavigate()
  const { setWindowSize } = useWindowSize()
  const { mouseMoveHandler, mouseUpHandler, mouseDownHandler } = useScreenDrag()

  const onClickModeChange = () => {
    navigate('/focus_control')
  }

  useEffect(() => {
    setWindowSize({ windowName: 'default-focus' })
    //TODO : 포커스 체크
    // window.message.receive('browser-window-focus', () => {
    //   console.log('browser-window-focus')

    // })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('browser-window-focus')
    }
  }, [storage?.done])

  //제거하기.
  return (
    <DefaultTaskWrap>
      <ModeChangeArea onClick={onClickModeChange}>
        <TaskName>{storage?.taskName}</TaskName>
        <CountDown
          minute={storage?.minute}
          color={'black'}
          done={storage?.done}
          doneText="타이머 완료"
          size={36}
          strokeWidth={16}
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
