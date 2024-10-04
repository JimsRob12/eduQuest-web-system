import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuestionData } from "@/components/Auth/Professor/Quiz/useQuestionData";
import { useQuestionEdit } from "@/contexts/QuestionProvider";

export const useFetchQuestionData = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const {
    question: questionData,
    isLoading,
    isError,
  } = useQuestionData(questionId!);
  const { setInitialQuestionData, resetToInitialState } = useQuestionEdit();

  useEffect(() => {
    // Reset the state when the questionId changes
    resetToInitialState();

    if (questionData && !isLoading && !isError) {
      setInitialQuestionData({
        ...questionData,
        points: questionData.points ?? 0,
        distractor: questionData.distractor ?? [],
      });
    }
  }, [
    questionId,
    questionData,
    isLoading,
    isError,
    setInitialQuestionData,
    resetToInitialState,
  ]);

  return { questionData, isLoading, isError };
};
