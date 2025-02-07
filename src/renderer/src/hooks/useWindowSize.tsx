import { useRef } from 'react'

type Props = {
  windowName: 'default-input' | 'input' | 'default-focus' | 'focus' | 'minimize_focus'
}

function useWindowSize() {
  const windowRef = useRef('none')
  const setWindowSize = ({ windowName }: Props) => {
    if (windowRef.current === windowName) return

    switch (windowName) {
      case 'input':
        return window.message.send('WINDOW_SIZE_CHANGE', 60)
      case 'focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 156)
      case 'minimize_focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 60)
    }
  }

  return { setWindowSize }
}

export default useWindowSize
