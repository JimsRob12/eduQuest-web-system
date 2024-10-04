import { useQuery } from "@tanstack/react-query";
import { getQuestion } from "@/services/api/apiQuiz";
import { QuizQuestions } from "@/lib/types";

export function useQuestionData(questionId: string) {
  const questionQuery = useQuery<QuizQuestions, Error>({
    queryKey: ["questions", questionId],
    queryFn: async () => {
      const question = await getQuestion(questionId);
      if (!question) {
        throw new Error("Question not found");
      }
      return question;
    },
  });
  return {
    question: questionQuery.data,
    isLoading: questionQuery.isPending,
    isError: questionQuery.isError,
  };
}
