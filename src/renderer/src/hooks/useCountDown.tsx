import { useStorage, useTaskDispatchContext } from '@renderer/context/TaskContext'
import React, { useState, useEffect, useRef } from 'react'

function useCountDown(durationInMinutes: number) {
  const { storage } = useStorage()
  const { dispatch } = useTaskDispatchContext()
  const [remainingTime, setRemainingTime] = useState({
    time: storage.time ? storage.time : durationInMinutes * 60,
    second: '00',
    minute: '00',
    progress: 0
  }) // Convert minutes to seconds
  const [isActive, setIsActive] = useState(false)

  const intervalId = useRef<NodeJS.Timer>()

  useEffect(() => {
    if (!storage.time) dispatch({ name: 'time', type: 'SET_TASK', value: remainingTime.time })
    if (storage.time < remainingTime.time)
      setRemainingTime((prev) => ({ ...prev, time: storage.time }))

    if (isActive && remainingTime.time > 0) {
      intervalId.current = setInterval(() => {
        setTime()
      }, 1000) // Update every second
    } else if (remainingTime.time === 0) {
      stopCount()
    }

    return () => clearInterval(intervalId.current) // Cleanup interval on component unmount
  }, [isActive, remainingTime])

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
  }

  const setPercent = (time: number) => {
    const totalTimeInSeconds = durationInMinutes * 60
    const timePassedInSeconds = totalTimeInSeconds - time
    const progress = (timePassedInSeconds / totalTimeInSeconds) * 100
    return progress
  }

  const startCount = () => {
    setIsActive(true)
  }

  const stopCount = () => {
    setIsActive(false)
    clearInterval(intervalId?.current)
  }

  return { remainingTime, setTime, startCount, stopCount }
}

export default useCountDown
