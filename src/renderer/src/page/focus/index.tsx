import { useEffect } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import TextField from '@renderer/component/TextField'
import WindowMinimizeSvg from '@assets/window_minimize.svg'
import PawDarkGraySvg from '@assets/paw_dark_gray.svg'
import { FocusPageWrapper, WindowMinimizeIcon, Wrapper } from './styled'
import { useNavigate } from 'react-router-dom'
import { useTimerContext } from '@renderer/context/TimerContext'
import Completed from './components/Completed'
import Process from './components/Process'
import CompletedPopup from './components/Popup/CompletedPopup'
import AskPopup from './components/Popup/AskPopup'

export function FocusPage(): JSX.Element {
  const { setWindowSize } = useWindowSize()
  const navigate = useNavigate()
  const { timer, isEnd } = useTimerContext()

  console.log(timer, isEnd)
  useEffect(() => {
    setWindowSize({ windowName: 'focus' })
    //TODO : 포커스 체크
    // window.message.receive('browser-window-focus', () => {
    //   console.log('browser-window-focus')
    // })
    // return () => {
    //   window.electron.ipcRenderer.removeAllListeners('browser-window-focus')
    // }
  }, [])

  const handleClickMinimize = () => {
    navigate('/minimize_focus')
  }

  //제거하기.
  return (
    <FocusPageWrapper>
      {/* <CompletedPopup /> */}
      <AskPopup />
      <WindowMinimizeIcon onClick={handleClickMinimize}>
        <WindowMinimizeSvg />
      </WindowMinimizeIcon>
      <TextField
        placeholder="태스크 이름 연동 필요"
        stretch
        disabled
        svg={<PawDarkGraySvg />}
        p_color="white"
      />

      <Wrapper>{isEnd ? <Completed /> : <Process timer={timer} />}</Wrapper>
    </FocusPageWrapper>
  )
}
