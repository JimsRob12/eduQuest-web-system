import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Save, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QuizSettingsForm from "./quiz-settings-form";
import { useQuizData } from "./useQuizData";
import QuizPreviewDialog from "./question-preview-dialog";

export default function QuizNavbar() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const titleRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    quiz,
    isLoading: isPending,
    isError,
    updateTitle,
    questions,
  } = useQuizData(quizId!);

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
      updateTitle(editedTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  useEffect(() => {
    const blockBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    const generateQuizPattern = /\/professor\/quiz\/[^/]+\/generate-quiz/;
    if (generateQuizPattern.test(location.pathname)) {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", blockBackNavigation);

      return () => {
        window.removeEventListener("popstate", blockBackNavigation);
      };
    }
  }, [location.pathname]);

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading quiz data</div>;

  return (
    <div className="-mx-6 flex w-screen flex-wrap items-center justify-between px-6 py-4 shadow-xl md:-mx-12 lg:-mx-16">
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
      <div className="mt-2 flex gap-2 sm:mt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex gap-1 text-xs" variant="outline">
              <Settings size={14} />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:text-white">
            {quiz && <QuizSettingsForm quiz={quiz} />}
          </DialogContent>
        </Dialog>
        <Button
          className="flex gap-1 text-xs"
          variant="secondary"
          onClick={() => setPreviewOpen(true)}
          disabled={!questions || questions.length === 0}
        >
          <Play size={14} />
          Preview
        </Button>
        <Button className="flex gap-1 text-xs" variant="default">
          <Save size={14} />
          Save
        </Button>
      </div>
      <QuizPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
