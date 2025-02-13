import ToastMessage from '@renderer/component/ToastMessage'
import { TimerWrapper, TrashIcon } from '../styled'
import TrashSvg from '@assets/trash.svg'
import CircularTimer from './CircularTimer'
import { useState } from 'react'

type ProcessProps = {
  timer: number
}

const Process = ({ timer }: ProcessProps) => {
  const [toastMessage, setToastMessage] = useState('')

  const handleClickTrash = () => {
    console.log('trash')
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
          initialTime={timer} // 23분 12초
          color="black"
          iconSize={24}
          size={54}
          setToastMessage={setToastMessage}
        />
      </TimerWrapper>
    </>
  )
}

export default Process
