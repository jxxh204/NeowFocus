import { useRef } from 'react'

type Props = {
  windowName: 'default-input' | 'input' | 'default-focus' | 'focus'
}

function useWindowSize() {
  const windowRef = useRef('none')
  const setWindowSize = ({ windowName }: Props) => {
    if (windowRef.current === windowName) return
    console.log('windowsize : ', windowName)

    switch (windowName) {
      case 'default-input':
        return window.message.send('WINDOW_SIZE_CHANGE', 150)
      case 'input':
        return window.message.send('WINDOW_SIZE_CHANGE', 210)
      case 'default-focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 90)
      case 'focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 160)
    }
  }

  return { setWindowSize }
}

export default useWindowSize
