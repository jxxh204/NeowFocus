import { useEffect, useRef, useState } from 'react'

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void
  onDrag?: (deltaX: number, deltaY: number, e: MouseEvent) => void
  onDragEnd?: (e: MouseEvent) => void
}

export const useDrag = (options: UseDragOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    let startX = 0
    let startY = 0

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      setIsDragging(true)
      startX = e.clientX
      startY = e.clientY
      dragStartPos.current = { x: startX, y: startY }
      
      options.onDragStart?.(e)
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && dragStartPos.current.x === 0) return
      
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      options.onDrag?.(deltaX, deltaY, e)
      
      if (window.electron?.windowMove) {
        window.electron.windowMove(deltaX, deltaY)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false)
      dragStartPos.current = { x: 0, y: 0 }
      
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