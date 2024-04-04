import { useStorage, useTaskDispatchContext } from '@renderer/context/TaskContext'
import { useState, useEffect, useRef } from 'react'

function useCountDown(durationInMinutes: number) {
  const { storage } = useStorage()
  const { dispatch } = useTaskDispatchContext()
  const [remainingTime, setRemainingTime] = useState({
    time: storage.time > 0 ? storage.time : durationInMinutes * 60,
    second: '00',
    minute: '00',
    progress: 0
  }) // Convert minutes to seconds
  const [isActive, setIsActive] = useState(false)

  const intervalId = useRef<NodeJS.Timer>()

  useEffect(() => {
    console.log(storage, remainingTime, durationInMinutes)
    if (storage.time < 0) dispatch({ name: 'time', type: 'SET_TASK', value: remainingTime.time })

    if (remainingTime.time <= 0 && storage.done) {
      stopCount()
      setIsActive(false)
    }

    if (isActive && remainingTime.time > -1) {
      intervalId.current = setInterval(() => {
        setTime()
      }, 1000) // Update every second
    }

    return () => stopCount() // Cleanup interval on component unmount
  }, [remainingTime.time])

  const setTime = () => {
    const time = remainingTime.time - 1
    const minutes = Math.floor(remainingTime.time / 60)
    const seconds = remainingTime.time % 60
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`

    // Calculate the percentage of time passed

    setRemainingTime({
      time: time,
      minute: formattedMinutes,
      second: formattedSeconds,
      progress: setPercent(time)
    })
    if (time < storage.time) dispatch({ name: 'time', type: 'SET_TASK', value: time })
    if (time <= 0) dispatch({ name: 'done', type: 'SET_TASK', value: true })
  }

  const setPercent = (time: number) => {
    const totalTimeInSeconds = durationInMinutes * 60
    const timePassedInSeconds = totalTimeInSeconds - time
    const progress = (timePassedInSeconds / totalTimeInSeconds) * 100
    return progress
  }

  const startCount = () => {
    console.log(storage.time, remainingTime.time)
    setTime()
    setIsActive(true)
  }

  const stopCount = () => {
    clearInterval(intervalId?.current)
  }

  return { remainingTime, startCount, stopCount }
}

export default useCountDown
