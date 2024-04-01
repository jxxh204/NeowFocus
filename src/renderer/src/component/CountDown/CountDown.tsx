import { useEffect, useRef } from 'react'
import useCountDown from './useCountDown'
import CanvasCircular from './CanvasCircular'
import CircularProgress from './CircularProgress'

type Props = {
  countMinutes: number
  color: string
  isMinutesTimer: boolean
}

function CountDown({ countMinutes, color, isMinutesTimer }: Props) {
  const { remainingTime, startCount, setTime } = useCountDown(countMinutes)
  useEffect(() => {
    setTime()
    startCount()
  }, [])

  return (
    <>
      {/* <CircularProgress size={70} strokeWidth={5} color={color} percentage={remainingTime.progress}>
        {isMinutesTimer ? (
          <>
            {remainingTime.minute} : {remainingTime.second}
          </>
        ) : null}
      </CircularProgress> */}
      <CanvasCircular
        size={50}
        strokeWidth={30}
        color={color}
        percentage={remainingTime.progress}
        text={`${remainingTime.minute} : ${remainingTime.second}`}
      ></CanvasCircular>
    </>
  )
}

export default CountDown
