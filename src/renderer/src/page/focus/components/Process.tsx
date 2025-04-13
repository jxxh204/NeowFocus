import ToastMessage from '@renderer/component/ToastMessage'
import { TimerWrapper, TrashIcon } from '../styled'
import TrashSvg from '@assets/trash.svg'
import CircularTimer from './CircularTimer'
import { useState } from 'react'
import { usePopup } from '@renderer/context/PopupContext'
import useCircularTimer from '@renderer/hooks/useCircularTimer'
import StatusIdle from './CircularTimer/StatusIdle'
import StatusPlay from './CircularTimer/StatusPlay'
import StatusPause from './CircularTimer/StatusPause'

type Props = {
  fullDuration: number
}

const Process = ({ fullDuration }: Props) => {
  const { timeLeft, status, handleStatus } = useCircularTimer({
    fullDuration: fullDuration
  })
  const [toastMessage, setToastMessage] = useState('')
  const { openPopup } = usePopup()

  const size = 54
  const iconSize = 24

  const handleClickTrash = () => {
    openPopup('ask')
    handleStatus('pause')
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
          fullDuration={fullDuration}
          iconSize={iconSize}
          size={size}
          currentDuration={timeLeft}
          setToastMessage={setToastMessage}
          status={status}
          handleStatus={handleStatus}
        >
          <>
            <StatusIdle size={size} timeLeft={timeLeft} status={status} />
            <StatusPlay
              size={size}
              iconSize={iconSize}
              status={status}
              handleClick={handleClickPlay}
            />
            <StatusPause
              size={size}
              iconSize={iconSize}
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
