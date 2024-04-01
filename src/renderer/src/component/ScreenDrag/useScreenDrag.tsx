import { useRef } from 'react'

// 문제 생기면 다시 사용하도록 send만 제거해놓음.
function useScreenDrag() {
  const on = useRef(false)
  // renderer Process

  const mouseMoveHandler = (e: React.MouseEvent<SVGElement>) => {
    const move = {
      mouseX: e.screenX,
      mouseY: e.screenY
    }
    if (on.current) {
      console.log('move', move)
      // window.message.send('MOUSE_MOVE', move)
    }
  }

  const mouseUpHandler = () => {
    // window.electron.sendMessage("MOUSE_UP", null);
    on.current = false
    console.log('up')
  }

  const mouseDownHandler = (e: React.MouseEvent<SVGElement>) => {
    const move = {
      mouseX: e.screenX,
      mouseY: e.screenY
    }
    // window.message.send('MOUSE_DOWN', move)
    on.current = true
    console.log('down')
  }
  return {
    mouseMoveHandler,
    mouseUpHandler,
    mouseDownHandler
  }
}

export default useScreenDrag
