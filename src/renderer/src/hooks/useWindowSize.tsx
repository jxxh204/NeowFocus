import { useEffect } from 'react'

type Props = {
  windowName: 'default-input' | 'input' | 'default-focus' | 'focus'
}

function useWindowSize() {
  const setWindowSize = ({ windowName }: Props) => {
    switch (windowName) {
      case 'default-input':
        return window.message.send('WINDOW_SIZE_CHANGE', 150)
      case 'input':
        return window.message.send('WINDOW_SIZE_CHANGE', 210)
      case 'default-focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 100)
      case 'focus':
        return window.message.send('WINDOW_SIZE_CHANGE', 150)
    }
  }

  return { setWindowSize }
}

export default useWindowSize
