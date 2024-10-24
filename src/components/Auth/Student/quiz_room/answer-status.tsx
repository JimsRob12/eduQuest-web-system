type EffectType = "correct" | "wrong" | "noAnswer" | null;

const AnswerStatus: React.FC<{
  hasAnswered: boolean;
  effect: EffectType;
  timeLeft: number | null;
}> = ({ hasAnswered, effect, timeLeft }) => {
  if (!hasAnswered && timeLeft !== null) {
    return (
      <div className="text-lg font-bold">Time Left: {timeLeft} seconds</div>
    );
  }

  const effectColors = {
    correct: "text-green-500",
    wrong: "text-red-500",
    noAnswer: "text-yellow-500",
  };

  const effectMessages = {
    correct: "Correct!",
    wrong: "Wrong!",
    noAnswer: "Time's up!",
  };

  if (hasAnswered)
    return (
      <div
        className={`mt-4 text-lg font-bold ${effect ? effectColors[effect] : ""}`}
      >
        {effect && effectMessages[effect]}
        <br />
        <span className="text-zinc-900 dark:text-white">
          Answer submitted! Waiting for other player's answer...
        </span>
      </div>
    );
};

export default AnswerStatus;
