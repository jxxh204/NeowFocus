function useWindowSize() {
  const setWindowSize = (height: number) => {
    window.message.send('WINDOW_SIZE_CHANGE', height)
  }

  return { setWindowSize }
}

export default useWindowSize
