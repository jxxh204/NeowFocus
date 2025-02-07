import { useEffect } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import pawDarkGray from '@assets/paw_dark_gray.svg'
import TextField from '@renderer/component/TextField'

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
  return <TextField placeholder="태스크 이름 연동 필요" stretch disabled imgSrc={pawDarkGray} />
}
