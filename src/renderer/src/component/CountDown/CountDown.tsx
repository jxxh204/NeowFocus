import CanvasCircular from './CanvasCircular'
import { remainingTime } from '@renderer/type/count'

type Props = {
  remainingTime: remainingTime
  color: string
  isMinutesTimer: boolean
}

function CountDown({ remainingTime, color }: Props) {
  return (
    <CanvasCircular
      size={50}
      strokeWidth={30}
      color={color}
      percentage={remainingTime.progress}
      text={`${remainingTime.minute} : ${remainingTime.second}`}
    ></CanvasCircular>
  )
}

export default CountDown
