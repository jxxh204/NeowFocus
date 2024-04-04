import useCountDown from '@renderer/hooks/useCountDown'
import AddTime from '../AddTime'
import CanvasCircular from './CanvasCircular'
import { useEffect } from 'react'

type Props = {
  minute: number
  color: string
  doneText?: string
  done: boolean
}

function CountDown({ minute, color, doneText, done }: Props) {
  const { remainingTime, startCount, stopCount } = useCountDown(Number(minute))

  useEffect(() => {
    if (done) {
      stopCount()
    } else {
      startCount()
    }
  }, [done])

  if (done && !doneText) {
    return <AddTime size={26} />
  }
  return (
    <CanvasCircular
      size={50}
      strokeWidth={30}
      color={color}
      percentage={remainingTime.progress}
      text={done && doneText ? doneText : `${remainingTime.minute} : ${remainingTime.second}`}
    ></CanvasCircular>
  )
}

export default CountDown
