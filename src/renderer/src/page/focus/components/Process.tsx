import ToastMessage from '@renderer/component/ToastMessage'
import { TimerWrapper, TrashIcon } from '../styled'
import TrashSvg from '@assets/trash.svg'
import CircularTimer from './CircularTimer'
import { useState } from 'react'
import { usePopup } from '@renderer/context/PopupContext'
import useCircularTimer from '@renderer/hooks/useCircularTimer'

type ProcessProps = {
  minute: number
}

const Process = ({ minute }: ProcessProps) => {
  const { timeLeft, status, handleStatus } = useCircularTimer({
    duration: 1500,
    initialTime: minute * 60
  })
  const [toastMessage, setToastMessage] = useState('')
  const { openPopup } = usePopup()

  const handleClickTrash = () => {
    openPopup('ask')
    handleStatus('pause')
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
          duration={1500} // 25분
          initialTime={minute * 60} // 23분 12초
          iconSize={24}
          size={54}
          timeLeft={timeLeft}
          setToastMessage={setToastMessage}
          status={status}
          handleStatus={handleStatus}
        />
      </TimerWrapper>
    </>
  )
}

export default Process
