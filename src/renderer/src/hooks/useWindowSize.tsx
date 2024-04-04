import { useRef } from 'react'

type Props = {
  windowName: 'default-input' | 'input' | 'default-focus' | 'focus'
}

function useWindowSize() {
  const windowRef = useRef('none')
  const setWindowSize = ({ windowName }: Props) => {
    if (windowRef.current === windowName) return

    switch (windowName) {
      case 'default-input':
        return window.message.send('WINDOW_SIZE_CHANGE', 134)
      case 'input':
        return window.message.send('WINDOW_SIZE_CHANGE', 194)
      case 'default-focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 60)
      case 'focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 154)
    }
  }

  return { setWindowSize }
}

export default useWindowSize
