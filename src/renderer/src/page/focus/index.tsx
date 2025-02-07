import { useEffect } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import pawDarkGray from '@assets/paw_dark_gray.svg'
import TextField from '@renderer/component/TextField'
import windowMinimize from '@assets/window_minimize.svg'
import styled from 'styled-components'

const FocusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
`

const WindowMinimizeIcon = styled.img`
  width: 22px;
  height: 22px;
  cursor: pointer;
  margin-bottom: 6px;
`

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
      <div>
        <div>1</div>
        <div>2</div>
      </div>
    </FocusPageWrapper>
  )
}
