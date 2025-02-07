import { useEffect } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import TextField from '@renderer/component/TextField'
import windowMinimize from '@assets/window_minimize.svg'
import trash from '@assets/trash.svg'
import pawDarkGray from '@assets/paw_dark_gray.svg'
import { FocusPageWrapper, WindowMinimizeIcon, TrashIcon, Wrapper } from './styled'
import CircularTimer from './components/CircularTimer'

export function FocusPage(): JSX.Element {
  const { setWindowSize } = useWindowSize()

  useEffect(() => {
    console.log('focus')
    setWindowSize({ windowName: 'focus' })
    //TODO : 포커스 체크
    // window.message.receive('browser-window-focus', () => {
    //   console.log('browser-window-focus')
    // })
    // return () => {
    //   window.electron.ipcRenderer.removeAllListeners('browser-window-focus')
    // }
  }, [])

  //제거하기.
  return (
    <FocusPageWrapper>
      <WindowMinimizeIcon src={windowMinimize} alt="윈도우 최소화 아이콘" />
      <TextField placeholder="태스크 이름 연동 필요" stretch disabled imgSrc={pawDarkGray} />

      <Wrapper>
        <TrashIcon src={trash} alt="휴지통 아이콘" />
        <CircularTimer
          duration={1500} // 25분
          initialTime={1380} // 23분 12초
          color="black"
          iconSize={24}
        />
      </Wrapper>
    </FocusPageWrapper>
  )
}
