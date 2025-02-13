import { useEffect, useState } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import TextField from '@renderer/component/TextField'
import WindowMinimizeSvg from '@assets/window_minimize.svg'
import TrashSvg from '@assets/trash.svg'
import PawDarkGraySvg from '@assets/paw_dark_gray.svg'
import {
  FocusPageWrapper,
  WindowMinimizeIcon,
  TrashIcon,
  Wrapper,
  TimerWrapper,
  ButtonWrapper
} from './styled'
import CircularTimer from './components/CircularTimer'
import ToastMessage from '@renderer/component/ToastMessage'
import { useNavigate } from 'react-router-dom'
import { useTimerContext } from '@renderer/context/TimerContext'
import Button from '@renderer/component/Button'

export function FocusPage(): JSX.Element {
  const { setWindowSize } = useWindowSize()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const { timer, isEnd } = useTimerContext()
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

  const handleClickTrash = () => {
    console.log('trash')
  }

  const handleClickMinimize = () => {
    navigate('/minimize_focus')
  }

  //제거하기.
  return (
    <FocusPageWrapper>
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

      <Wrapper>
        {isEnd ? (
          <ButtonWrapper>
            <Button value="이 작업 끝!" type="outlined" />
            <Button value="한번 더" type="filled" />
          </ButtonWrapper>
        ) : (
          <TrashIcon onClick={handleClickTrash}>
            <TrashSvg />
          </TrashIcon>
        )}

        {/* TODO : 리팩터링 필요 */}
        <TimerWrapper>
          {toastMessage && <ToastMessage message={toastMessage} />}
          <CircularTimer
            duration={1500} // 25분
            initialTime={timer} // 23분 12초
            color="black"
            iconSize={24}
            size={54}
            setToastMessage={setToastMessage}
          />
        </TimerWrapper>
      </Wrapper>
    </FocusPageWrapper>
  )
}
