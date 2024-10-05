import Loader from "@/components/Shared/Loader";
import { useGetQuizzes } from "../useGetQuizzes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quiz, User } from "@/lib/types";
import { EllipsisVertical, FileQuestion, Plus, Trash } from "lucide-react";
import { formatTimeAgo } from "@/lib/helpers";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuiz, deleteQuiz } from "@/services/api/apiQuiz";
import toast from "react-hot-toast";

interface QuizCardProps {
  quiz: Quiz;
  user: User;
  onEdit: (quizId: string) => void;
  onDelete: (quizId: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  user,
  onEdit,
  onDelete,
}) => (
  <div key={quiz.quiz_id} className="my-2 flex gap-4 rounded border p-3">
    <img
      src={quiz.cover_image || "/edu-quest-logo.png"}
      alt={quiz.title}
      className={`h-28 object-cover ${!quiz.cover_image && "rounded bg-zinc-100 p-2 dark:bg-zinc-800"}`}
    />
    <div className="flex flex-grow flex-col justify-between">
      <div className="space-y-1">
        <p
          className={`w-fit rounded-full px-2 text-[0.6rem] font-semibold uppercase ${
            quiz.status === "draft"
              ? "bg-red-300 text-red-700"
              : "bg-green-300 text-green-700"
          }`}
        >
          {quiz.status}
        </p>
        <h3 className="text-lg font-bold">{quiz.title}</h3>
        <div className="flex items-center gap-1 opacity-60">
          <FileQuestion size={18} />
          <p className="text-sm">
            {quiz.quiz_questions?.length ?? 0} Question
            {quiz.quiz_questions?.length !== 1 ? "s" : ""}
            {quiz.subject && <span className="italic"> • {quiz.subject}</span>}
          </p>
        </div>
      </div>
      <p className="text-xs opacity-50">
        <span className="font-semibold">{user?.name}</span> •{" "}
        {formatTimeAgo(new Date(quiz.created_at))}
      </p>
    </div>
    <div className="flex flex-col items-end justify-between">
      <Popover>
        <PopoverTrigger>
          <EllipsisVertical size={18} />
        </PopoverTrigger>
        <PopoverContent side="left" align="start" className="h-fit w-fit p-0">
          <Button
            variant="link"
            className="gap-1"
            onClick={() => onDelete(quiz.quiz_id)}
          >
            <Trash size={16} />
            Delete
          </Button>
        </PopoverContent>
      </Popover>
      {quiz.status.toLowerCase() === "draft" && (
        <Button onClick={() => onEdit(quiz.quiz_id)}>Continue editing</Button>
      )}
    </div>
  </div>
);

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { quizzes = [], isPending, isError } = useGetQuizzes();

  const safeQuizzes: Quiz[] = Array.isArray(quizzes) ? quizzes : [quizzes];
  const activeQuizzes = safeQuizzes.filter(
    (quiz: Quiz) => quiz.status === "active",
  );
  const draftQuizzes = safeQuizzes.filter(
    (quiz: Quiz) => quiz.status === "draft",
  );

  const { mutate: createNewQuiz, isPending: isCreatingQuiz } = useMutation({
    mutationFn: () => {
      if (user) {
        return createQuiz(user.id);
      }
      throw new Error("User is not authenticated");
    },
    onSuccess: (data) => {
      if (data) {
        navigate(`/professor/quiz/${data.quiz_id}/generate-quiz`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create quiz: ${error.message}`);
    },
  });

  const { mutate: mutateDeleteQuiz } = useMutation({
    mutationFn: async (quizId: string) => deleteQuiz(user!.id, quizId),
    onSuccess: () => {
      toast.success("Quiz deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["quizzes", user!.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEditQuiz = (quizId: string) => {
    navigate(`/professor/quiz/${quizId}/customize`);
  };

  const handleDeleteQuiz = (quizId: string) => {
    mutateDeleteQuiz(quizId);
  };

  if (isPending) return <Loader />;
  if (isError) return <p>Error loading quizzes.</p>;

  return (
    <div className="p-4">
      <Tabs defaultValue="active-quizzes">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="active-quizzes">
              Active Quizzes ({activeQuizzes.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({draftQuizzes.length})
            </TabsTrigger>
          </TabsList>
          <Button
            onClick={() => createNewQuiz()}
            className="gap-1 px-3 md:hidden"
            disabled={isCreatingQuiz}
          >
            {isCreatingQuiz ? (
              "Creating..."
            ) : (
              <>
                <Plus size={16} /> Create Quiz
              </>
            )}
          </Button>
        </div>
        <TabsContent value="active-quizzes">
          {activeQuizzes.length > 0 ? (
            activeQuizzes.map((quiz: Quiz) => (
              <QuizCard
                key={quiz.quiz_id}
                quiz={quiz}
                user={user!}
                onEdit={handleEditQuiz}
                onDelete={handleDeleteQuiz}
              />
            ))
          ) : (
            <p>No active quizzes available.</p>
          )}
        </TabsContent>
        <TabsContent value="draft">
          {draftQuizzes.length > 0 ? (
            draftQuizzes.map((quiz: Quiz) => (
              <QuizCard
                key={quiz.quiz_id}
                quiz={quiz}
                user={user!}
                onEdit={handleEditQuiz}
                onDelete={handleDeleteQuiz}
              />
            ))
          ) : (
            <p>No draft quizzes available.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
