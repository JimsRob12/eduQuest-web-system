import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuestionEdit } from "@/contexts/QuestionProvider";
import { useFetchQuestionData } from "./useFetchQuestionData";

export default function QuizEditQuestionNavbar() {
  const navigate = useNavigate();
  useFetchQuestionData();
  const {
    questionType,
    points,
    time,
    hasUnsavedChanges,
    updateQuestionType,
    updatePoints,
    updateTime,
  } = useQuestionEdit();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="-mx-6 flex w-screen flex-wrap items-center justify-between px-6 py-4 shadow-xl md:-mx-12 lg:-mx-16">
      <div className="flex items-center gap-4">
        {hasUnsavedChanges ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button>
                <ChevronLeft className="rounded border p-1" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to go back?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Any unsaved changes will be lost. Please make sure to save
                  your changes before leaving.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBack}>
                  Go Back
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <button>
            <ChevronLeft className="rounded border p-1" onClick={handleBack} />
          </button>
        )}

        <Select value={questionType} onValueChange={updateQuestionType}>
          <SelectTrigger className="w-36 border-none">
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Question Type</SelectLabel>
              {["Multiple Choice", "True/False", "Fill in the Blank"].map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={points.toString()}
          onValueChange={(value) => updatePoints(parseInt(value))}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Points" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Points</SelectLabel>
              {[1, 2, 3, 5, 10].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} point{value !== 1 && "s"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={time.toString()}
          onValueChange={(value) => updateTime(parseInt(value))}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Time</SelectLabel>
              {[10, 15, 20, 30, 60].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} second{value !== 1 && "s"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          className="flex gap-1 text-xs"
          variant="default"
          disabled={!hasUnsavedChanges}
        >
          <Save size={14} />
          Save Question
        </Button>
      </div>
    </div>
  );
}
