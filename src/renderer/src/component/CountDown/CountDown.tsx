import AddTime from '../AddTime'
import CanvasCircular from './CanvasCircular'
import { remainingTime } from '@renderer/type/count'

type Props = {
  remainingTime: remainingTime
  color: string
  doneText?: string
  done: boolean
}

function CountDown({ remainingTime, color, doneText, done }: Props) {
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
