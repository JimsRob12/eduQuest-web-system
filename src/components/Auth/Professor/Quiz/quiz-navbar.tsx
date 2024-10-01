// QuizNavbar.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Save, Settings } from "lucide-react";
import { getQuizById, updateQuizTitle } from "@/services/api/apiQuiz";
import { Quiz } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QuizSettingsForm from "./quiz-settings-form";

export default function QuizNavbar() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

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
      return data as unknown as Quiz;
    },
    enabled: !!quizId,
  });

  const updateTitleMutation = useMutation({
    mutationFn: (newTitle: string) => updateQuizTitle(quizId!, newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });

  useEffect(() => {
    if (quiz) {
      setEditedTitle(quiz.title || "Untitled Quiz");
    }
  }, [quiz]);

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isEditing]);

  const handleTitleClick = () => setIsEditing(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editedTitle !== quiz?.title) {
      updateTitleMutation.mutate(editedTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading quiz data</div>;

  return (
    <div className="-mx-6 flex w-screen items-center justify-between px-6 py-4 shadow-xl md:-mx-12 lg:-mx-16">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="rounded border p-1" />
        </button>
        {isEditing ? (
          <Input
            ref={titleRef}
            type="text"
            value={editedTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="rounded border px-2 py-1 dark:bg-zinc-800"
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {quiz?.title || "Untitled Quiz"}
          </h1>
        )}
      </div>
      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex gap-1 text-xs" variant="outline">
              <Settings size={14} />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:text-white">
            <QuizSettingsForm quiz={quiz} />
          </DialogContent>
        </Dialog>
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
