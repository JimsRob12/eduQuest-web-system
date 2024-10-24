import React, { useMemo } from "react";
import { FillInTheBlank, MultipleChoice, TrueFalse } from "./question-type";
import { shuffleArray } from "@/lib/helpers";

type EffectType = "correct" | "wrong" | "noAnswer" | null;

interface QuestionContentProps {
  question: string;
  questionType: string;
  distractor?: string[];
  rightAnswer: string;
  isTabletOrMobile: boolean;
  theme: string;
  hasAnswered: boolean;
  selectedAnswer: string | null;
  effect: EffectType;
  handleAnswer: (answer: string) => void;
  answerInput: string[];
  setAnswerInput: React.Dispatch<React.SetStateAction<string[]>>;
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  shuffleOptions?: boolean;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  question,
  questionType,
  distractor,
  rightAnswer,
  isTabletOrMobile,
  theme,
  hasAnswered,
  selectedAnswer,
  effect,
  handleAnswer,
  answerInput,
  setAnswerInput,
  inputRefs,
  shuffleOptions = false,
}) => {
  // Use useMemo to shuffle distractors only once when the component mounts
  // or when question/distractor changes
  const shuffledDistractors = useMemo(() => {
    if (!shuffleOptions || !distractor) return distractor;
    return shuffleArray(distractor);
  }, [distractor, shuffleOptions]);

  const renderQuestion = () => {
    switch (questionType.toLowerCase()) {
      case "mcq":
        return (
          <MultipleChoice
            distractor={shuffledDistractors!}
            isTabletOrMobile={isTabletOrMobile}
            theme={theme}
            hasAnswered={hasAnswered}
            selectedAnswer={selectedAnswer}
            effect={effect}
            handleAnswer={handleAnswer}
          />
        );
      case "boolean":
        return (
          <TrueFalse
            hasAnswered={hasAnswered}
            selectedAnswer={selectedAnswer}
            effect={effect}
            handleAnswer={handleAnswer}
          />
        );
      case "short":
        return (
          <FillInTheBlank
            rightAnswer={rightAnswer}
            hasAnswered={hasAnswered}
            effect={effect}
            answerInput={answerInput}
            setAnswerInput={setAnswerInput}
            handleAnswer={handleAnswer}
            inputRefs={inputRefs}
            isTabletOrMobile={isTabletOrMobile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-6 w-full">
      <h2 className="mb-4 flex h-44 items-center justify-center rounded-lg bg-zinc-200 text-xl dark:bg-zinc-800">
        {question}
      </h2>
      {renderQuestion()}
    </div>
  );
};

export default QuestionContent;
