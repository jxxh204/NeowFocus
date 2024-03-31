import React, { useState, useEffect, useRef } from "react";

function useCountDown(durationInMinutes: number) {
  const [remainingTime, setRemainingTime] = useState({
    time: durationInMinutes * 60,
    second: "00",
    minute: "00",
    progress: 0,
  }); // Convert minutes to seconds
  const [isActive, setIsActive] = useState(false);

  const intervalId = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (isActive && remainingTime.time > 0) {
      intervalId.current = setInterval(() => {
        setTime();
      }, 1000); // Update every second
    } else if (remainingTime.time === 0) {
      stopCount();
    }

    return () => clearInterval(intervalId.current); // Cleanup interval on component unmount
  }, [isActive, remainingTime]);

  const setTime = () => {
    const time = remainingTime.time - 1;
    const minutes = Math.floor(remainingTime.time / 60);
    const seconds = remainingTime.time % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    // Calculate the percentage of time passed

    setRemainingTime({
      time: time,
      minute: formattedMinutes,
      second: formattedSeconds,
      progress: setPercent(time),
    });
  };

  const setPercent = (time: number) => {
    const totalTimeInSeconds = durationInMinutes * 60;
    const timePassedInSeconds = totalTimeInSeconds - time;
    const progress = (timePassedInSeconds / totalTimeInSeconds) * 100;
    return progress;
  };

  const startCount = () => {
    setIsActive(true);
  };

  const stopCount = () => {
    setIsActive(false);
    clearInterval(intervalId.current);
  };

  return { remainingTime, setTime, startCount, stopCount };
}

export default useCountDown;
