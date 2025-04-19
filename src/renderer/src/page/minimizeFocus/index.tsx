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

const MiniMizeFocus = () => {
  const navigate = useNavigate()
  const { setWindowSize } = useWindowSize()
  const { currentTask, updateTask } = useTaskContext()
  const { timeLeft } = useCircularTimer(currentTask.taskDuration)

  const handleClickDragHandle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    console.log('drag handle', e.clientX, e.clientY)
  }

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
      <DragHandleWrapper onDrag={handleClickDragHandle}>
        <DragHandleSvg />
      </DragHandleWrapper>
    </Wrapper>
  )
}

export default MiniMizeFocus
