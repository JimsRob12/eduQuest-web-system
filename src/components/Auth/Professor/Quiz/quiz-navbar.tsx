import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Save, Settings } from "lucide-react";
import { getQuizById } from "@/services/api/apiQuiz";
import { Quiz } from "@/lib/types";

export default function QuizNavbar() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const {
    data: quiz,
    isPending,
    isError,
  } = useQuery<Quiz, Error>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const data = await getQuizById(quizId!);
      if (!data) {
        throw new Error("Quiz not found");
      }
      return data as Quiz;
    },
    enabled: !!quizId,
  });

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading quiz data</div>;

  return (
    <div className="-mx-6 flex w-screen items-center justify-between px-6 py-4 shadow-xl md:-mx-12 lg:-mx-16">
      <div className="flex gap-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="rounded border p-1" />
        </button>
        <h1>{quiz?.title || "Untitled Quiz"}</h1>
      </div>
      <div className="flex gap-2">
        <Button className="flex gap-1 text-xs" variant="outline">
          <Settings size={14} />
          Settings
        </Button>
        <Button
          className="flex gap-1 text-xs"
          variant="secondary"
          disabled={!quiz.question_type}
        >
          <Play size={14} />
          Preview
        </Button>
        <Button className="flex gap-1 text-xs" variant="default">
          <Save size={14} />
          Save
        </Button>
      </div>
    </div>
  );
}
