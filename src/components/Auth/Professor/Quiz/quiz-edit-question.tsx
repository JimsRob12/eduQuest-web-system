import { getQuestion } from "@/services/api/apiQuiz";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export default function QuizEditQuestion() {
  const { questionId } = useParams();

  const { data: questionData } = useQuery({
    queryKey: ["question", questionId],
    queryFn: async () => {
      const data = await getQuestion(questionId!);
      if (!data) {
        throw new Error("Quiz not found");
      }
      return data;
    },
    enabled: !!questionId,
  });

  console.log(questionData);

  return <div className="mt-8">QuizEditQuestion</div>;
}
