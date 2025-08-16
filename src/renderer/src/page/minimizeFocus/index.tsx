import { useEffect } from 'react'
import useWindowSize from '../../hooks/useWindowSize'
import TextField from '@renderer/component/TextField'
import { ClickArea, DragHandleWrapper, Wrapper } from './styled'
import CircularTimer from './components/CircularTimer'
import theme from '@renderer/styles/theme'
import { useNavigate } from 'react-router-dom'
import DragHandleSvg from '@assets/drag_handle.svg'
import { useTaskContext } from '@renderer/context/TaskContext'
import useCircularTimer from '@renderer/hooks/useCircularTimer'
import { useDrag } from '@renderer/hooks/useDrag'

const MiniMizeFocus = () => {
  const navigate = useNavigate()
  const { setWindowSize } = useWindowSize()
  const { currentTask, updateTask } = useTaskContext()
  const { timeLeft } = useCircularTimer(currentTask.taskDuration)
  const { dragRef, isDragging } = useDrag({
    onDragStart: () => {
      console.log('Drag started')
    },
    onDrag: (deltaX, deltaY) => {
      console.log('Dragging:', deltaX, deltaY)
    },
    onDragEnd: () => {
      console.log('Drag ended')
    }
  })

  useEffect(() => {
    setWindowSize({ windowName: 'minimize_focus' })
  }, [])

  useEffect(() => {
    if (currentTask.taskStatus === 'end') {
      setWindowSize({ windowName: 'focus' })
    }
  }, [currentTask.taskStatus])

  useEffect(() => {
    updateTask(timeLeft)
  }, [timeLeft])

  return (
    <Wrapper gap={8}>
      <ClickArea gap={8} onClick={() => navigate('/focus')}>
        <TextField placeholder={currentTask.taskName} stretch disabled p_color="white" />
        <CircularTimer
          timeLeft={timeLeft}
          fullDuration={currentTask.fullDuration}
          size={36}
          strokeWidth={3}
          bgColor={theme.color.gray[300]}
          progressColor="black"
        />
      </ClickArea>
      <DragHandleWrapper ref={dragRef} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <DragHandleSvg />
      </DragHandleWrapper>
    </Wrapper>
  )
}

export default MiniMizeFocus
