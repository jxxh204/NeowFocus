import { IPC_CHANNELS } from '@renderer/constants'

function useWindowSize() {
  const setWindowSize = (size: number | { width?: number; height?: number }) => {
    window.message.send(IPC_CHANNELS.WINDOW_SIZE_CHANGE, size)
  }

  return { setWindowSize }
}

export default useWindowSize
