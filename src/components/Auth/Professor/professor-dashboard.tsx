import Loader from "@/components/Shared/Loader";
import { useGetQuizzes } from "../useGetQuizzes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quiz, User } from "@/lib/types";
import { EllipsisVertical, FileQuestion, Trash } from "lucide-react";
import { formatTimeAgo } from "@/lib/helpers";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

interface QuizCardProps {
  quiz: Quiz;
  user: User;
  onEdit: (quizId: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, user, onEdit }) => (
  <div key={quiz.quiz_id} className="my-2 flex gap-4 rounded border p-3">
    <img
      src={quiz.cover_image || "/edu-quest-logo.png"}
      alt={quiz.title}
      className={`h-28 object-cover ${!quiz.cover_image && "rounded bg-zinc-100 p-2 dark:bg-zinc-800"}`}
    />
    <div className="flex flex-grow flex-col justify-between">
      <div className="space-y-1">
        <p className="w-fit rounded-full bg-red-300 px-2 text-[0.6rem] font-semibold uppercase text-red-700">
          {quiz.status}
        </p>
        <h3 className="text-lg font-bold">{quiz.title}</h3>
        <div className="flex items-center gap-1 opacity-60">
          <FileQuestion size={18} />
          <p className="text-sm">
            {quiz.quiz_questions?.length ?? 0} Question
            {quiz.quiz_questions?.length !== 1 ? "s" : ""}
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
          <Button variant="link" className="gap-1">
            <Trash size={16} />
            Delete
          </Button>
        </PopoverContent>
      </Popover>
      <Button onClick={() => onEdit(quiz.quiz_id)}>Continue editing</Button>
    </div>
  </div>
);

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizzes = [], isPending, isError } = useGetQuizzes();

  if (isPending) return <Loader />;
  if (isError) return <p>Error loading quizzes.</p>;

  const safeQuizzes: Quiz[] = Array.isArray(quizzes) ? quizzes : [quizzes];
  const activeQuizzes = safeQuizzes.filter(
    (quiz: Quiz) => quiz.status === "active",
  );
  const draftQuizzes = safeQuizzes.filter(
    (quiz: Quiz) => quiz.status === "draft",
  );

  const handleEditQuiz = (quizId: string) => {
    navigate(`/professor/quiz/${quizId}/customize`);
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="active-quizzes">
        <TabsList>
          <TabsTrigger value="active-quizzes">
            Active Quizzes ({activeQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts ({draftQuizzes.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active-quizzes">
          {activeQuizzes.length > 0 ? (
            activeQuizzes.map((quiz: Quiz) => (
              <QuizCard
                key={quiz.quiz_id}
                quiz={quiz}
                user={user!}
                onEdit={handleEditQuiz}
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
