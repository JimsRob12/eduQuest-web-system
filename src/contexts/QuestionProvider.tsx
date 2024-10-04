import React, { createContext, useState, useContext } from "react";
import { formatQuestionType } from "@/lib/helpers";

type QuestionData = {
  question_type: string;
  points: number;
  time: number;
  question: string;
  distractor: string[];
  right_answer: string;
};

type QuestionEditContextType = {
  questionType: string;
  points: number;
  time: number;
  question: string;
  distractors: string[];
  rightAnswer: string;
  hasUnsavedChanges: boolean;
  isInitialDataSet: boolean;
  updateQuestionType: (type: string) => void;
  updatePoints: (points: number) => void;
  updateTime: (time: number) => void;
  updateQuestion: (question: string) => void;
  updateDistractors: (distractors: string[]) => void;
  updateRightAnswer: (answer: string) => void;
  setInitialQuestionData: (data: QuestionData) => void;
};

const QuestionEditContext = createContext<QuestionEditContextType | undefined>(
  undefined,
);

export const QuestionEditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [questionType, setQuestionType] = useState("");
  const [points, setPoints] = useState(0);
  const [time, setTime] = useState(0);
  const [question, setQuestion] = useState("");
  const [distractors, setDistractors] = useState<string[]>([]);
  const [rightAnswer, setRightAnswer] = useState("");
  const [isInitialDataSet, setIsInitialDataSet] = useState(false);

  const [initialState, setInitialState] = useState({
    questionType: "",
    points: 0,
    time: 0,
    question: "",
    distractors: [] as string[],
    rightAnswer: "",
  });

  const setInitialQuestionData = (data: QuestionData) => {
    if (!isInitialDataSet) {
      const formattedType = formatQuestionType(data.question_type);
      setQuestionType(formattedType);
      setPoints(data.points ?? 0);
      setTime(data.time);
      setQuestion(data.question);
      setDistractors(data.distractor || []);
      setRightAnswer(data.right_answer);

      setInitialState({
        questionType: formattedType,
        points: data.points ?? 0,
        time: data.time,
        question: data.question,
        distractors: data.distractor || [],
        rightAnswer: data.right_answer,
      });

      setIsInitialDataSet(true);
    }
  };

  const hasUnsavedChanges =
    questionType !== initialState.questionType ||
    points !== initialState.points ||
    time !== initialState.time ||
    question !== initialState.question ||
    JSON.stringify(distractors) !== JSON.stringify(initialState.distractors) ||
    rightAnswer !== initialState.rightAnswer;

  const updateQuestionType = (type: string) => setQuestionType(type);
  const updatePoints = (points: number) => setPoints(points);
  const updateTime = (time: number) => setTime(time);
  const updateQuestion = (question: string) => setQuestion(question);
  const updateDistractors = (distractors: string[]) =>
    setDistractors(distractors);
  const updateRightAnswer = (answer: string) => setRightAnswer(answer);

  return (
    <QuestionEditContext.Provider
      value={{
        questionType,
        points,
        time,
        question,
        distractors,
        rightAnswer,
        hasUnsavedChanges,
        isInitialDataSet,
        updateQuestionType,
        updatePoints,
        updateTime,
        updateQuestion,
        updateDistractors,
        updateRightAnswer,
        setInitialQuestionData,
      }}
    >
      {children}
    </QuestionEditContext.Provider>
  );
};

export const useQuestionEdit = () => {
  const context = useContext(QuestionEditContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionEdit must be used within a QuestionEditProvider",
    );
  }
  return context;
};
