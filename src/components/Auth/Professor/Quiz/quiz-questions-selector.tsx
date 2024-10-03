import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Minus, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuiz } from "@/contexts/QuizProvider";

const MAX_QUESTIONS_OPTIONS = [5, 10, 15, 20];

export default function MaxQuestionsSelector() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { quizId } = useParams();
  const { quizData, updateQuiz } = useQuiz();

  const handleOptionClick = (value: number) => {
    setSelectedOption(value);
    setShowCustomInput(false);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomValue(value);
    if (value && !isNaN(Number(value))) {
      setSelectedOption(parseInt(value, 10));
    }
  };

  const handleCustomOptionClick = () => {
    setShowCustomInput(true);
    setSelectedOption(null);
  };

  const handleSubmit = async () => {
    if (selectedOption && quizId) {
      setIsLoading(true);
      try {
        // Update quizData with the selected number of questions
        quizData.maxQuestions = selectedOption;

        // Call updateQuiz to update the existing quiz
        const updatedQuizId = await updateQuiz(quizId, selectedOption);

        if (updatedQuizId) {
          toast.success("Quiz updated successfully!");
          // You might want to redirect to the updated quiz page or update the UI
        } else {
          toast.error("Failed to update quiz");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error updating quiz: ${error.message}`);
        } else {
          toast.error("Error updating quiz");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("No option selected or quiz ID not found");
    }
  };

  return (
    <div className="flex h-[calc(100%-5rem)] w-full flex-col justify-center">
      <h2 className="text-xl font-bold md:text-3xl">
        Set Your Students' Next Challenge!
      </h2>
      <p>
        How tough do you want to make this quiz? Choose how many questions your
        students need to conquer! Once the quiz is generated, you can still
        tweak it—add, remove, or even edit questions to fine-tune the challenge!
      </p>

      <div className="mb-4 mt-8">
        <h2 className="my-2 font-bold">Select number of questions</h2>
        <div className="grid grid-cols-2 gap-4">
          {MAX_QUESTIONS_OPTIONS.map((option) => (
            <Button
              key={option}
              onClick={() => handleOptionClick(option)}
              variant={"outline"}
              className={`rounded-lg p-4 py-6 text-white shadow-lg transition-transform hover:scale-105 ${selectedOption === option ? "bg-gradient-to-r from-purple-500 to-indigo-500" : ""}`}
              disabled={isLoading}
            >
              <span className="text-white">{option} Questions</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="">
        <Button
          onClick={handleCustomOptionClick}
          className={`w-full px-6 py-4 font-semibold ${
            showCustomInput
              ? "bg-white text-purple-600"
              : "bg-purple-700 hover:bg-purple-800"
          }`}
          disabled={isLoading}
        >
          Custom Challenge
        </Button>
      </div>

      {showCustomInput && (
        <div className="mt-6 flex items-center justify-center">
          <button
            className="rounded-lg bg-zinc-900 p-1 text-white dark:bg-zinc-50 dark:text-black"
            onClick={() =>
              setCustomValue(Math.max(1, parseInt(customValue) - 1).toString())
            }
            disabled={isLoading}
          >
            <Minus size={14} />
          </button>
          <Input
            type="number"
            value={customValue}
            onChange={handleCustomInputChange}
            placeholder="Enter number of questions"
            className="mx-2 w-fit text-center font-semibold"
            disabled={isLoading}
          />
          <button
            className="rounded-lg bg-zinc-900 p-1 text-white dark:bg-zinc-50 dark:text-black"
            onClick={() =>
              setCustomValue((parseInt(customValue) + 1).toString())
            }
            disabled={isLoading}
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      <div className="mt-8 self-end">
        <Button
          onClick={handleSubmit}
          className="px-6 py-3 font-bold"
          variant={"secondary"}
          disabled={!selectedOption || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Quiz...
            </>
          ) : (
            <>Generate the Challenge!</>
          )}
        </Button>
      </div>
    </div>
  );
}
