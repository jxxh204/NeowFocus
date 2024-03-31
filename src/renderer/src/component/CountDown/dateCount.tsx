import { useState, useEffect, useRef } from "react";

export function useCountDown(targetDate: number, count: number) {
  const [remainingTime, setRemainingTime] = useState({
    second: 0,
    minute: 0,
    progress: 0,
  });
  const timeId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeId.current = setTimeout(() => {
      startCount();
    }, 1000);
    return () => clearTimeout(timeId.current);
  }, [remainingTime]);

  const getDateTime = () => {
    const date = new Date().getTime();
    const countDate = new Date(targetDate); // date가 어디서 왔는지는 알 수 없지만 예제 코드 기준으로 가정합니다.
    countDate.setMinutes(countDate.getMinutes() + count); // 기존의 값을 변경하여 계산합니다.
    const distance = countDate.getTime(); // 변경된 시간을 가져옵니다.
    return { date, distance };
  };

  const startCount = () => {
    const { date, distance } = getDateTime();
    const time_left = distance - date;
    if (time_left > 0) {
      const second = Math.floor((time_left % (1000 * 60)) / 1000);
      const minute = Math.floor((time_left / 1000 / 60) % 60);
      const progress = 1 - time_left / (60 * 1000 * count);
      setRemainingTime({ second, minute, progress });
    } else {
      stopCount();
    }
  };
  const stopCount = () => {
    setRemainingTime({ second: 0, minute: 0, progress: 0 });
    clearTimeout(timeId.current);
  };

  return { remainingTime, startCount, stopCount };
}
