import { useEffect, useRef } from "react";
import useCountDown from "./useCountDown";
import CanvasCircular from "./CanvasCircular";

type Props = {
  countMinutes: number;
  color: string;
  isMinutesTimer: boolean;
};

function CountDown({ countMinutes, color, isMinutesTimer }: Props) {
  const { remainingTime, startCount, setTime } = useCountDown(countMinutes);
  useEffect(() => {
    setTime();
    startCount();
  }, []);

  return (
    <>
      <CanvasCircular
        size={50}
        strokeWidth={25}
        color={color}
        percentage={remainingTime.progress}
      />
      {isMinutesTimer ? (
        <p>
          {remainingTime.minute} : {remainingTime.second}
        </p>
      ) : null}
    </>
  );
}

export default CountDown;
