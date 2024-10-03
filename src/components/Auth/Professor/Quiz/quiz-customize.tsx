import React, { useState } from "react";
import { getQuestions, updateBulkPointsAndTime } from "@/services/api/apiQuiz";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuizQuestions } from "@/lib/types";
import { toast } from "react-hot-toast";
import {
  Grip,
  Loader2,
  Scale,
  Check,
  RectangleEllipsis,
  HelpCircle,
} from "lucide-react";
import { formatQuestionType, questionTypeIcon } from "@/lib/helpers";

const iconMapping = {
  Scale: Scale,
  Check: Check,
  RectangleEllipsis: RectangleEllipsis,
  HelpCircle: HelpCircle,
};

export default function CustomizeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const [bulkPoints, setBulkPoints] = useState<string>("");
  const [bulkTime, setBulkTime] = useState<string>("30");
  const [customPoints, setCustomPoints] = useState<boolean>(false);
  const [customTime, setCustomTime] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    data: quizQuestions = [],
    isPending,
    isError,
  } = useQuery<QuizQuestions[], Error>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const data = await getQuestions(quizId!);
      if (!data) {
        throw new Error("Quiz not found");
      }
      return data as unknown as QuizQuestions[];
    },
    enabled: !!quizId,
  });

  const { mutate: updateBulk, isPending: isUpdatingBulk } = useMutation({
    mutationFn: () => updateBulkPointsAndTime(quizId!, bulkPoints, bulkTime),
    onSuccess: () => {
      toast.success("Bulk update successful");
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCustomInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  };

  const renderCustomInput = (
    placeholder: string,
    value: string,
    onChange: (value: string) => void,
    onReset: () => void,
  ) => (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading questions</div>;

  const totalPoints = quizQuestions.reduce(
    (total, q) => total + (q.points ?? 0),
    0,
  );

  return (
    <div className="mt-8 grid grid-cols-[300px_1fr] gap-4">
      <div className="h-fit rounded-lg bg-zinc-50 p-5 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-bold">Bulk Update Questions</h2>
        <div className="space-y-4">
          {!customPoints ? (
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  setCustomPoints(true);
                  setBulkPoints("");
                } else {
                  setBulkPoints(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Points" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Points per Question</SelectLabel>
                  {[1, 2, 3, 5, 10].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} point{value !== 1 && "s"}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            renderCustomInput(
              "Enter custom points",
              bulkPoints,
              (value) => handleCustomInput(value, setBulkPoints),
              () => setCustomPoints(false),
            )
          )}

          {!customTime ? (
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  setCustomTime(true);
                  setBulkTime("");
                } else {
                  setBulkTime(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time per Question</SelectLabel>
                  {[10, 15, 20, 30, 60].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} second{value !== 1 && "s"}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            renderCustomInput(
              "Enter custom time (seconds)",
              bulkTime,
              (value) => handleCustomInput(value, setBulkTime),
              () => setCustomTime(false),
            )
          )}

          <Button
            onClick={() => updateBulk()}
            className="w-full"
            disabled={isUpdatingBulk || (!bulkPoints && !bulkTime)}
          >
            {isUpdatingBulk ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply Bulk Update"
            )}
          </Button>
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold">
          {quizQuestions.length} Question{quizQuestions.length !== 1 && "s"}{" "}
          <span className="font-normal opacity-60">({totalPoints} points)</span>
        </h2>
        <ul className="space-y-4">
          {quizQuestions.map((q, index) => (
            <li
              key={q.quiz_question_id}
              className="rounded-lg bg-white p-4 shadow dark:bg-zinc-900"
            >
              <div className="mb-2 flex justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Grip className="size-6 rounded-md border border-zinc-200 py-1 dark:border-zinc-800" />
                  <div className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                    {React.createElement(
                      iconMapping[questionTypeIcon(q.question_type)],
                      { size: 12 },
                    )}
                    <p>{index + 1}.</p>{" "}
                    <p>{formatQuestionType(q.question_type)}</p>
                  </div>
                  <Select
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setCustomTime(true);
                        setBulkTime("");
                      } else {
                        setBulkTime(value);
                      }
                    }}
                  >
                    <Select
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setCustomPoints(true);
                          setBulkPoints("");
                        } else {
                          setBulkPoints(value);
                        }
                      }}
                    >
                      <SelectTrigger className="h-fit w-fit px-2 py-1 text-xs">
                        <SelectValue placeholder="Points" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Points per Question</SelectLabel>
                          {[1, 2, 3, 5, 10].map((value) => (
                            <SelectItem key={value} value={value.toString()}>
                              {value} point{value !== 1 && "s"}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <SelectTrigger className="h-fit w-fit px-2 py-1 text-xs">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Time per Question</SelectLabel>
                        {[10, 15, 20, 30, 60].map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value} second{value !== 1 && "s"}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div></div>
              </div>
              <span>{q.question}</span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    console.log(
                      `Editing question with id: ${q.quiz_question_id}`,
                    )
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    console.log(
                      `Deleting question with id: ${q.quiz_question_id}`,
                    )
                  }
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button
          onClick={() => console.log("Adding a new question")}
          className="mt-4"
        >
          Add More Questions
        </Button>
      </div>
    </div>
  );
}
