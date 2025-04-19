import ToastMessage from '@renderer/component/ToastMessage'
import { TimerWrapper, TrashIcon } from '../styled'
import TrashSvg from '@assets/trash.svg'
import CircularTimer from './CircularTimer'
import { useEffect, useRef, useState } from 'react'
import { usePopup } from '@renderer/context/PopupContext'
import useCircularTimer from '@renderer/hooks/useCircularTimer'
import StatusIdle from './CircularTimer/StatusIdle'
import StatusPlay from './CircularTimer/StatusPlay'
import StatusPause from './CircularTimer/StatusPause'
import type { Task, TaskStatus } from '@renderer/context/TaskContext'

type Props = {
  updateTask: (duration: number, status?: TaskStatus) => void
  currentTask: Task
}

const Process = ({ updateTask, currentTask }: Props) => {
  const { timeLeft, status, handleStatus } = useCircularTimer(currentTask.taskDuration)
  const [toastMessage, setToastMessage] = useState('')
  const { openPopup } = usePopup()

  const size = useRef(54)
  const iconSize = useRef(24)

  useEffect(() => {
    updateTask(timeLeft)
    if (timeLeft < 0) {
      handleStatus('end')
      updateTask(0, 'end')
      return
    }
  }, [timeLeft])

  const handleClickTrash = () => {
    openPopup('ask') // TODO : 팝업의 내용을 모르겠음. 리팩터링 필요
    handleStatus('idle')
  }

  const handleClickCircularTimer = () => {
    if (status === 'pause') {
      handleStatus('play')
      setToastMessage('타이머 재개')
    }
    if (status === 'play') {
      handleStatus('pause')
      setToastMessage('타이머 일시정지')
    }
  }

  const CircularTimerMouseHover = () => {
    if (status === 'idle') {
      handleStatus('pause')
      setToastMessage('타이머 일시정지')
    }
    if (status === 'play') {
      setToastMessage('타이머 재개')
    }
  }
  const CircularTimerMouseLeave = () => {
    if (status === 'pause') {
      handleStatus('idle')
    }
    setToastMessage('')
  }
  return (
    <>
      <TrashIcon onClick={handleClickTrash}>
        <TrashSvg />
      </TrashIcon>

      {/* TODO : 리팩터링 필요 */}
      <TimerWrapper onClick={handleClickCircularTimer}>
        {toastMessage && <ToastMessage message={toastMessage} />}
        <CircularTimer
          fullDuration={currentTask.fullDuration}
          iconSize={iconSize.current}
          size={size.current}
          currentDuration={timeLeft}
          status={status}
          handleMouseEnter={CircularTimerMouseHover}
          handleMouseLeave={CircularTimerMouseLeave}
        >
          <StatusIdle size={size.current} timeLeft={timeLeft} status={status} />
          <StatusPlay size={size.current} iconSize={iconSize.current} status={status} />
          <StatusPause size={size.current} iconSize={iconSize.current} status={status} />
        </CircularTimer>
      </TimerWrapper>
    </>
  )
}

export default Process
