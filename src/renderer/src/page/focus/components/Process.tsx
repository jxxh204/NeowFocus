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
  const { timeLeft, status, handleStatus } = useCircularTimer(currentTask.fullDuration)
  const [toastMessage, setToastMessage] = useState('')
  const { openPopup } = usePopup()

  const size = useRef(54)
  const iconSize = useRef(24)

  useEffect(() => {
    if (status == 'play') return
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

  const handleClickPlay = () => {
    handleStatus('pause')
    setToastMessage('타이머 일시정지')
  }

  const handleClickPause = () => {
    handleStatus('play')
    setToastMessage('타이머 재개')
  }
  return (
    <>
      <TrashIcon onClick={handleClickTrash}>
        <TrashSvg />
      </TrashIcon>

      {/* TODO : 리팩터링 필요 */}
      <TimerWrapper>
        {toastMessage && <ToastMessage message={toastMessage} />}
        <CircularTimer
          fullDuration={currentTask.fullDuration}
          iconSize={iconSize.current}
          size={size.current}
          currentDuration={timeLeft}
          setToastMessage={setToastMessage}
          status={status}
          handleStatus={handleStatus}
        >
          <>
            <StatusIdle size={size.current} timeLeft={timeLeft} status={status} />
            <StatusPlay
              size={size.current}
              iconSize={iconSize.current}
              status={status}
              handleClick={handleClickPlay}
            />
            <StatusPause
              size={size.current}
              iconSize={iconSize.current}
              status={status}
              handleClick={handleClickPause}
            />
          </>
        </CircularTimer>
      </TimerWrapper>
    </>
  )
}

export default Process
