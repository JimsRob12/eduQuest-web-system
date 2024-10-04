import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeProvider";
import { Check, Plus, Trash } from "lucide-react";
import { getDarkerShade } from "@/lib/helpers";
import { useQuestionEdit } from "@/contexts/QuestionProvider";
import { useFetchQuestionData } from "./useFetchQuestionData";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";

export default function QuizEditQuestion() {
  const { theme } = useTheme();
  useFetchQuestionData();
  const {
    question,
    distractors,
    rightAnswer,
    updateQuestion,
    updateDistractors,
    updateRightAnswer,
  } = useQuestionEdit();

  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8C33"];
  const lightColors = ["#FF8C66", "#37a753", "#668CFF", "#FF66C2", "#FFB366"];

  const showPlusButton = distractors.length < 5;

  // Add a new distractor input (empty) without auto-selecting as the right answer
  const addDistractor = () => {
    updateDistractors([...distractors, ""]);
  };

  // Delete distractor but ensure at least 2 distractors remain, even if they are empty
  const deleteDistractor = (index: number) => {
    if (distractors.length > 2) {
      const newDistractors = [...distractors];
      newDistractors.splice(index, 1); // Remove the selected distractor
      updateDistractors(newDistractors);

      // If the right answer is the one being deleted, clear the right answer
      if (rightAnswer === distractors[index]) {
        updateRightAnswer("");
      }
    } else {
      toast.error("At least two distractors must remain.");
    }
  };

  // Update a specific distractor's value
  const updateDistractor = (index: number, value: string) => {
    const updatedDistractors = [...distractors];
    updatedDistractors[index] = value;
    updateDistractors(updatedDistractors);
  };

  // Handle marking the right answer with a validation check
  const handleRightAnswer = (distractor: string) => {
    if (!distractor.trim()) {
      toast.error("Cannot mark an empty input as the correct answer!");
    } else {
      updateRightAnswer(distractor);
    }
  };

  return (
    <div className="mt-8 flex h-[calc(100%-8rem)] w-full items-center justify-center">
      <div className="w-[70vw] rounded-xl bg-zinc-200 p-4 dark:bg-zinc-900">
        <Textarea
          value={question}
          onChange={(e) => updateQuestion(e.target.value)}
          className="rounded-lg py-16 text-center text-xl font-semibold shadow-lg"
          style={{ resize: "none" }}
        />

        {distractors.length > 0 && (
          <div
            className="mt-4 grid gap-2 rounded-lg"
            style={{
              gridTemplateColumns: showPlusButton
                ? `repeat(${distractors.length}, 1fr) auto`
                : `repeat(${distractors.length}, 1fr)`,
            }}
          >
            {distractors.map((distractor, index) => {
              const bgColor =
                theme === "dark"
                  ? lightColors[index % lightColors.length]
                  : colors[index % colors.length];

              const darkerBgColor = getDarkerShade(bgColor, 15);
              const isSelected = rightAnswer === distractor;

              const buttonBgColor =
                isSelected && distractor.trim() !== ""
                  ? "bg-green-500"
                  : "bg-zinc-800 bg-opacity-20";

              return (
                <div
                  key={index}
                  className="rounded-lg p-1"
                  style={{
                    backgroundColor: bgColor,
                    color: "#fff",
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <button
                      className="rounded-md bg-zinc-50 bg-opacity-20 p-1.5"
                      onClick={() => deleteDistractor(index)}
                      disabled={distractors.length <= 2}
                    >
                      <Trash className="fill-white" size={14} />
                    </button>
                    <button
                      className={`rounded-full border p-1 ${buttonBgColor}`}
                      onClick={() => handleRightAnswer(distractor)}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                  <Input
                    value={distractor}
                    onChange={(e) => updateDistractor(index, e.target.value)}
                    placeholder="Type your answer here"
                    className="mt-2 h-32 border-none text-center text-lg focus-visible:ring-0 dark:placeholder:text-white dark:placeholder:text-opacity-50"
                    onFocus={(e) =>
                      (e.target.style.backgroundColor = darkerBgColor)
                    }
                    onBlur={(e) => (e.target.style.backgroundColor = bgColor)}
                  />
                </div>
              );
            })}
            {showPlusButton && (
              <div className="flex items-center justify-center">
                <button
                  className="rounded-md bg-zinc-900 bg-opacity-20 p-1.5 text-white dark:bg-white dark:text-black"
                  onClick={addDistractor}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
