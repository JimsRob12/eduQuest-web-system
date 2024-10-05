import React, { createContext, useState, useContext, useCallback } from "react";
import { formatQuestionType, parseQuestionType } from "@/lib/helpers";
import { QuizQuestions } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateQuestion as updateQuestionApi } from "@/services/api/apiQuiz";
import toast from "react-hot-toast";

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
  setInitialQuestionData: (data: QuizQuestions) => void;
  resetToInitialState: () => void;
  saveQuestion: () => void;
  isSaving: boolean;
  saveError: Error | null;
};

const QuestionEditContext = createContext<QuestionEditContextType | undefined>(
  undefined,
);

export const QuestionEditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  const [questionType, setQuestionType] = useState("");
  const [points, setPoints] = useState(0);
  const [time, setTime] = useState(0);
  const [question, setQuestion] = useState("");
  const [distractors, setDistractors] = useState<string[]>([]);
  const [rightAnswer, setRightAnswer] = useState("");
  const [isInitialDataSet, setIsInitialDataSet] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [order, setOrder] = useState(0);
  const [initialState, setInitialState] = useState({
    questionType: "",
    points: 0,
    time: 0,
    question: "",
    distractors: [] as string[],
    rightAnswer: "",
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (params: QuizQuestions) => updateQuestionApi(params),
    onSuccess: () => {
      setInitialState({
        questionType,
        points,
        time,
        question,
        distractors,
        rightAnswer,
      });
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({ queryKey: ["questions", quizId] });
    },
    onError: () => {
      toast.error("Failed to update question");
    },
  });

  const setInitialQuestionData = useCallback((data: QuizQuestions) => {
    const formattedType = formatQuestionType(data.question_type);
    setQuestionType(formattedType);
    setPoints(data.points ?? 0);
    setTime(data.time);
    setQuestion(data.question);
    setDistractors(data.distractor || []);
    setRightAnswer(data.right_answer);
    setQuizId(data.quiz_id);
    setQuestionId(data.quiz_question_id);
    setOrder(data.order);
    setIsInitialDataSet(true);

    // Set the initial state when the data is first loaded
    setInitialState({
      questionType: formattedType,
      points: data.points ?? 0,
      time: data.time,
      question: data.question,
      distractors: data.distractor || [],
      rightAnswer: data.right_answer,
    });
  }, []);

  const resetToInitialState = useCallback(() => {
    setQuestionType("");
    setPoints(0);
    setTime(0);
    setQuestion("");
    setDistractors([]);
    setRightAnswer("");
    setIsInitialDataSet(false);
    setInitialState({
      questionType: "",
      points: 0,
      time: 0,
      question: "",
      distractors: [],
      rightAnswer: "",
    });
  }, []);

  const hasUnsavedChanges =
    questionType !== initialState.questionType ||
    points !== initialState.points ||
    time !== initialState.time ||
    question !== initialState.question ||
    JSON.stringify(distractors) !== JSON.stringify(initialState.distractors) ||
    rightAnswer !== initialState.rightAnswer;

  const updateQuestionType = (type: string) => {
    setQuestionType(type);
    setRightAnswer("");

    switch (type) {
      case "True/False":
        setDistractors(["True", "False"]);
        break;
      case "Fill in the Blank":
        setDistractors([rightAnswer]);
        break;
      default:
        break;
    }
  };

  const updatePoints = (points: number) => setPoints(points);
  const updateTime = (time: number) => setTime(time);
  const updateQuestion = (question: string) => setQuestion(question);
  const updateDistractors = (distractors: string[]) =>
    setDistractors(distractors);
  const updateRightAnswer = (answer: string) => {
    setRightAnswer(answer);
    // If it's Fill in the Blank, update the distractor as well
    if (questionType === "Fill in the Blank") {
      setDistractors([answer]);
    }
  };

  const saveQuestion = () => {
    const questionData: QuizQuestions = {
      quiz_question_id: questionId,
      quiz_id: quizId,
      question: question,
      question_type: parseQuestionType(questionType),
      right_answer: rightAnswer,
      points: points,
      distractor: distractors,
      time: time,
      order: order,
    };

    updateQuestionMutation.mutate(questionData);
  };

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
        resetToInitialState,
        saveQuestion,
        isSaving: updateQuestionMutation.isPending,
        saveError: updateQuestionMutation.error as Error | null,
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
