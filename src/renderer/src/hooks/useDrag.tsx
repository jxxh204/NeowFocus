import { useEffect, useRef, useState } from 'react'

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void
  onDrag?: (deltaX: number, deltaY: number, e: MouseEvent) => void
  onDragEnd?: (e: MouseEvent) => void
}

export const useDrag = (options: UseDragOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const windowStartPos = useRef({ x: 0, y: 0 })
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    let startX = 0
    let startY = 0

    const handleMouseDown = async (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      setIsDragging(true)
      startX = e.screenX
      startY = e.screenY
      dragStartPos.current = { x: startX, y: startY }
      
      // Get current window position when drag starts
      if (window.electron?.getWindowPosition) {
        const position = await window.electron.getWindowPosition()
        windowStartPos.current = { x: position.x, y: position.y }
      }
      
      options.onDragStart?.(e)
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && dragStartPos.current.x === 0) return
      
      const deltaX = e.screenX - startX
      const deltaY = e.screenY - startY
      
      options.onDrag?.(deltaX, deltaY, e)
      
      // Set absolute position instead of relative movement
      if (window.electron?.setWindowPosition) {
        const newX = windowStartPos.current.x + deltaX
        const newY = windowStartPos.current.y + deltaY
        window.electron.setWindowPosition(newX, newY)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false)
      dragStartPos.current = { x: 0, y: 0 }
      windowStartPos.current = { x: 0, y: 0 }
      
      options.onDragEnd?.(e)
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    element.addEventListener('mousedown', handleMouseDown)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, options])

  return {
    dragRef: (el: HTMLElement | null) => {
      elementRef.current = el
    },
    isDragging
  }
}