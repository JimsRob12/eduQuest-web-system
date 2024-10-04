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
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuestionData } from "./useQuestionData";
import { formatQuestionType } from "@/lib/helpers";

export default function QuizEditQuestionNavbar() {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const { question: questionData } = useQuestionData(questionId!);

  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedPoints, setSelectedPoints] = useState<number | undefined>(
    undefined,
  );
  const [selectedTime, setSelectedTime] = useState<number | undefined>(
    undefined,
  );

  const [initialType, setInitialType] = useState<string>("");
  const [initialPoints, setInitialPoints] = useState<number | undefined>(
    undefined,
  );
  const [initialTime, setInitialTime] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (questionData) {
      const formattedType = formatQuestionType(questionData.question_type);
      setSelectedType(formattedType);
      setSelectedPoints(questionData.points);
      setSelectedTime(questionData.time);

      setInitialType(formattedType);
      setInitialPoints(questionData.points);
      setInitialTime(questionData.time);
    }
  }, [questionData]);

  const hasUnsavedChanges =
    selectedType !== initialType ||
    selectedPoints !== initialPoints ||
    selectedTime !== initialTime;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="-mx-6 flex w-screen flex-wrap items-center justify-between px-6 py-4 shadow-xl md:-mx-12 lg:-mx-16">
      <div className="flex items-center gap-4">
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
                Any unsaved changes will be lost. Please make sure to save your
                changes before leaving.
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

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-36 border-none">
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Question Type</SelectLabel>
              {["Multiple Choice", "True/False", "Fill in the Blank"].map(
                (value) => (
                  <SelectItem key={value} value={value.toString()}>
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
          value={selectedPoints?.toString()}
          onValueChange={(value) => setSelectedPoints(parseInt(value))}
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
          value={selectedTime?.toString()}
          onValueChange={(value) => setSelectedTime(parseInt(value))}
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
