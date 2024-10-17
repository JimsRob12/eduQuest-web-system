import { useEffect, useState } from "react";

type CircleTimerProps = {
  initialTime: number;
};

const CircleTimer = ({ initialTime = 5 }: CircleTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (timeLeft === 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const progress = (timeLeft / initialTime) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="40" height="40" className="absolute left-4 right-4">
        <circle
          stroke="gray"
          fill="transparent"
          strokeWidth="4"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          stroke="green"
          fill="transparent"
          strokeWidth="4"
          r={radius}
          cx="20"
          cy="20"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute text-sm font-bold">{timeLeft}</div>
    </div>
  );
};

export default CircleTimer;
