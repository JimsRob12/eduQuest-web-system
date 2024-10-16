const QuestionHeader: React.FC<{ questionNumber: number; points: number }> = ({
  questionNumber,
  points,
}) => (
  <div className="flex w-full items-center justify-between">
    <h1 className="mb-4 text-2xl font-bold">Question {questionNumber}</h1>
    <p className="text-xl font-bold">
      {points} point{points > 1 && "s"}
    </p>
  </div>
);

export default QuestionHeader;
