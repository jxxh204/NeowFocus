import { useEffect } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import TextField from '@renderer/component/TextField'
import WindowMinimizeSvg from '@assets/window_minimize.svg'
import PawDarkGraySvg from '@assets/paw_dark_gray.svg'
import { FocusPageWrapper, WindowMinimizeIcon, Wrapper } from './styled'
import { useNavigate } from 'react-router-dom'
import Completed from './components/Completed'
import Process from './components/Process'
import { useTaskContext } from '@renderer/context/TaskContext'
export function FocusPage(): JSX.Element {
  const { setWindowSize } = useWindowSize()
  const navigate = useNavigate()
  const { currentTask, taskStatus, updateTask } = useTaskContext()
  useEffect(() => {
    setWindowSize({ windowName: 'focus' })
  }, [])

  const handleClickMinimize = () => {
    navigate('/minimize_focus')
  }

  //제거하기.
  return (
    <FocusPageWrapper>
      <WindowMinimizeIcon onClick={handleClickMinimize}>
        <WindowMinimizeSvg />
      </WindowMinimizeIcon>

      <TextField
        placeholder={currentTask.taskName}
        stretch
        disabled
        svg={<PawDarkGraySvg />}
        p_color="white"
      />

      {/* TODO : 아이콘 어디있는지 찾기 힘듬 */}
      <Wrapper>
        {taskStatus === 'end' ? (
          <Completed />
        ) : (
          <Process updateTask={updateTask} currentTask={currentTask} />
        )}
      </Wrapper>
    </FocusPageWrapper>
  )
}
