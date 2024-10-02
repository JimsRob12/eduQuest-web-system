import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  LucideIcon,
  RectangleEllipsis,
  Scale,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { updateQuizType } from "@/services/api/apiQuiz";

function QuestionTypeOption({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
  isLoading,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`transform cursor-pointer rounded-lg p-4 transition-transform hover:scale-105 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <h3 className="flex items-center gap-2 font-bold">
        {isLoading ? (
          <Loader2 className="animate-spin rounded text-white" size={20} />
        ) : (
          <Icon className="rounded bg-purple-700 p-1 text-white" size={20} />
        )}
        {title}
      </h3>
      <p className="mt-1 text-xs opacity-60">{description}</p>
    </div>
  );
}

export default function QuizTypeModal({
  hasQuestions,
}: {
  hasQuestions: boolean;
}) {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const updateQuizTypeMutation = useMutation({
    mutationFn: ({
      quizId,
      questionType,
    }: {
      quizId: string;
      questionType: string;
    }) => updateQuizType(quizId, questionType),
    onSuccess: (data, variables) => {
      navigate(
        `/professor/quiz/${variables.quizId}/add-question/${variables.questionType}`,
      );
    },
    onError: (error) => {
      console.error("Error updating quiz type:", error);
    },
  });

  function handleSelect(type: string) {
    if (quizId) {
      updateQuizTypeMutation.mutate({ quizId, questionType: type });
    } else {
      console.error("Quiz ID is undefined");
    }
  }

  const questionTypes = [
    {
      icon: Check,
      title: "Multiple Choice",
      description:
        "Check for retention by asking students to pick one or more correct answers. Use text, images, or math equations to spice things up!",
      type: "multiple-choice",
    },
    {
      icon: Scale,
      title: "True/False",
      description:
        "Assess students' understanding with simple true or false questions. Great for quick checks and straightforward topics.",
      type: "true-false",
    },
    {
      icon: RectangleEllipsis,
      title: "Fill in the Blank",
      description:
        "Evaluate students' knowledge by having them fill in the missing words or phrases. Ideal for testing comprehension and recall.",
      type: "fill-in-the-blank",
    },
  ];

  const content = (
    <div>
      <h1 className="text-xl font-bold md:text-3xl">Create a new quiz</h1>
      <p>Select Question Type</p>
      <div className="mt-8">
        <h2 className="my-2 font-bold">Create a new question</h2>
        <div className="grid grid-cols-2 gap-4">
          {questionTypes.map(({ icon, title, description, type }) => (
            <QuestionTypeOption
              key={type}
              icon={icon}
              title={title}
              description={description}
              onClick={() => handleSelect(type)}
              disabled={updateQuizTypeMutation.isPending}
              isLoading={
                updateQuizTypeMutation.isPending &&
                updateQuizTypeMutation.variables?.questionType === type
              }
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (!hasQuestions) {
    return <div className="p-8">{content}</div>;
  }

  return (
    <Dialog open={hasQuestions}>
      <DialogContent className="dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold md:text-3xl">
            Create a new quiz
          </DialogTitle>
          <DialogDescription>Select Question Type</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
