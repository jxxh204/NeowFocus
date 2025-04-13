import { useEffect } from 'react'
import useWindowSize from '../../hooks/useWindowSize'
import TextField from '@renderer/component/TextField'
import { ClickArea, DragHandleWrapper, IconWrapper, Wrapper } from './styled'
import CircularTimer from './components/CircularTimer'
import theme from '@renderer/styles/theme'
import PawGraySvg from '@assets/paw_gray.svg'
import { useNavigate } from 'react-router-dom'
import DragHandleSvg from '@assets/drag_handle.svg'
import { useTaskContext } from '@renderer/context/TaskContext'

const MiniMizeFocus = () => {
  const navigate = useNavigate()
  const { setWindowSize } = useWindowSize()
  const { currentTask } = useTaskContext()

  const handleClickDragHandle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    console.log('drag handle', e.clientX, e.clientY)
  }

  const calculatePercentage = (initialTime: number, duration: number) => {
    return ((duration - initialTime) / duration) * 100
  }

  useEffect(() => {
    setWindowSize({ windowName: 'minimize_focus' })
  }, [])

  // TODO : 컴포넌트 구조 리팩터링 필요
  return (
    <Wrapper gap={8}>
      <ClickArea gap={8} onClick={() => navigate('/focus')}>
        <TextField placeholder={currentTask.taskName} stretch disabled p_color="white" />
        <CircularTimer
          duration={currentTask.taskMinute * 60} // 25분
          size={36}
          strokeWidth={3}
          bgColor={theme.color.gray[300]}
          progressColor="black"
        >
          <IconWrapper size={16} percentage={calculatePercentage(1380, 1500)}>
            <PawGraySvg />
          </IconWrapper>
        </CircularTimer>
      </ClickArea>
      <DragHandleWrapper onDrag={handleClickDragHandle}>
        <DragHandleSvg />
      </DragHandleWrapper>
    </Wrapper>
  )
}

export default MiniMizeFocus
