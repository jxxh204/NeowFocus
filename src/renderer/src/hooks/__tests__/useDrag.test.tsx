import { renderHook, act } from '@testing-library/react'
import { useDrag } from '../useDrag'

describe('useDrag', () => {
  let mockElement: HTMLElement
  
  beforeEach(() => {
    mockElement = document.createElement('div')
    jest.clearAllMocks()
  })

  it('should initialize with isDragging as false', () => {
    const { result } = renderHook(() => useDrag())
    
    expect(result.current.isDragging).toBe(false)
  })

  it('should set element ref correctly', () => {
    const { result } = renderHook(() => useDrag())
    
    act(() => {
      result.current.dragRef(mockElement)
    })
    
    // Element should have mousedown listener attached
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      screenX: 100,
      screenY: 200
    })
    
    mockElement.dispatchEvent(mousedownEvent)
    
    // Should prevent default and stop propagation
    expect(mousedownEvent.defaultPrevented).toBe(true)
  })

  it('should call onDragStart when dragging starts', async () => {
    const onDragStart = jest.fn()
    const { result } = renderHook(() => useDrag({ onDragStart }))
    
    act(() => {
      result.current.dragRef(mockElement)
    })
    
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      screenX: 100,
      screenY: 200
    })
    
    await act(async () => {
      mockElement.dispatchEvent(mousedownEvent)
    })
    
    expect(onDragStart).toHaveBeenCalledWith(expect.any(MouseEvent))
  })

  it('should call onDrag during mouse movement', async () => {
    const onDrag = jest.fn()
    const { result } = renderHook(() => useDrag({ onDrag }))
    
    act(() => {
      result.current.dragRef(mockElement)
    })
    
    // Start dragging
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      screenX: 100,
      screenY: 200
    })
    
    await act(async () => {
      mockElement.dispatchEvent(mousedownEvent)
    })
    
    // Move mouse
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      screenX: 150,
      screenY: 250
    })
    
    act(() => {
      document.dispatchEvent(mousemoveEvent)
    })
    
    expect(onDrag).toHaveBeenCalledWith(50, 50, expect.any(MouseEvent))
  })

  it('should call onDragEnd when dragging ends', async () => {
    const onDragEnd = jest.fn()
    const { result } = renderHook(() => useDrag({ onDragEnd }))
    
    act(() => {
      result.current.dragRef(mockElement)
    })
    
    // Start dragging
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      screenX: 100,
      screenY: 200
    })
    
    await act(async () => {
      mockElement.dispatchEvent(mousedownEvent)
    })
    
    // End dragging
    const mouseupEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true
    })
    
    act(() => {
      document.dispatchEvent(mouseupEvent)
    })
    
    expect(onDragEnd).toHaveBeenCalledWith(expect.any(MouseEvent))
  })

  it('should update window position when dragging', async () => {
    const { result } = renderHook(() => useDrag())
    
    // Mock window position
    ;(window as any).electron.getWindowPosition = jest.fn().mockResolvedValue({ x: 500, y: 300 })
    ;(window as any).electron.setWindowPosition = jest.fn()
    
    act(() => {
      result.current.dragRef(mockElement)
    })
    
    // Start dragging
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      screenX: 100,
      screenY: 200
    })
    
    await act(async () => {
      mockElement.dispatchEvent(mousedownEvent)
    })
    
    // Move mouse
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      screenX: 150,
      screenY: 250
    })
    
    act(() => {
      document.dispatchEvent(mousemoveEvent)
    })
    
    expect((window as any).electron.setWindowPosition).toHaveBeenCalledWith(550, 350)
  })

  it('should clean up event listeners on unmount', async () => {
    const { result, unmount } = renderHook(() => useDrag())
    
    act(() => {
      result.current.dragRef(mockElement)
    })
    
    const removeEventListenerSpy = jest.spyOn(mockElement, 'removeEventListener')
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
  })
})