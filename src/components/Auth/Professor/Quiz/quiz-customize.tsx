import React, { useEffect, useState } from "react";
import {
  getQuestions,
  updateBulkPointsAndTime,
  updateQuestionOrder,
  updateSingleQuestion,
} from "@/services/api/apiQuiz";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
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
  Loader2,
  Scale,
  Check,
  RectangleEllipsis,
  HelpCircle,
  GripVertical,
  Trash,
  Pen,
  X,
  Copy,
  Plus,
} from "lucide-react";
import { formatQuestionType, questionTypeIcon } from "@/lib/helpers";

const iconMapping = {
  Scale: Scale,
  Check: Check,
  RectangleEllipsis: RectangleEllipsis,
  HelpCircle: HelpCircle,
};

export default function CustomizeQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [bulkPoints, setBulkPoints] = useState<string>("1");
  const [bulkTime, setBulkTime] = useState<string>("30");
  const [customPoints, setCustomPoints] = useState<boolean>(false);
  const [customTime, setCustomTime] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    data: quizQuestionsData,
    isPending,
    isError,
  } = useQuery<QuizQuestions[], Error>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const data = await getQuestions(quizId!);
      if (!data) {
        throw new Error("Quiz not found");
      }
      return data.sort((a, b) => a.order - b.order) as QuizQuestions[];
    },
    enabled: !!quizId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (quizQuestionsData && Array.isArray(quizQuestionsData)) {
      setQuestions(quizQuestionsData.sort((a, b) => a.order - b.order));
    } else {
      setQuestions([]);
    }
  }, [quizQuestionsData]);

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

  const { mutate: updateSingle } = useMutation({
    mutationFn: (params: {
      questionId: string;
      points?: string;
      time?: string;
    }) =>
      updateSingleQuestion(
        quizId!,
        params.questionId,
        params.points,
        params.time,
      ),
    onSuccess: () => {
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { mutate: reorderQuestions } = useMutation({
    mutationFn: (newOrder: { id: string; order: number }[]) =>
      updateQuestionOrder(quizId!, newOrder),
    onSuccess: () => {
      toast.success("Question order updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update question order");
      console.error(error);
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    if (type === "group") {
      const reorderedQuestions = Array.from(questions);
      const [reorderedItem] = reorderedQuestions.splice(source.index, 1);
      reorderedQuestions.splice(destination.index, 0, reorderedItem);

      const updatedQuestions = reorderedQuestions.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setQuestions(updatedQuestions);

      reorderQuestions(
        updatedQuestions.map((item) => ({
          id: item.quiz_question_id,
          order: item.order,
        })),
      );
    }
  };

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading questions</div>;

  const totalPoints = Array.isArray(questions)
    ? questions.reduce((total, q) => total + (q.points ?? 0), 0)
    : 0;

  return (
    <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
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
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {questions.length} Question{questions.length !== 1 && "s"}{" "}
            <span className="font-normal opacity-60">
              ({totalPoints} points)
            </span>
          </h2>
          <Button className="gap-1" size="sm">
            <Plus size={18} />
            Add Question
          </Button>
        </div>
        <div className="h-[72vh] overflow-y-auto pr-2">
          {Array.isArray(questions) && questions.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions" type="group">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {questions.map((q, index) => (
                      <Draggable
                        key={q.quiz_question_id}
                        draggableId={q.quiz_question_id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`rounded-lg bg-white p-4 shadow dark:bg-zinc-900 ${
                              snapshot.isDragging ? "opacity-50" : ""
                            }`}
                          >
                            <div>
                              <div className="mb-2 flex flex-wrap justify-between text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="size-6 cursor-move rounded-md border border-zinc-200 p-1 dark:border-zinc-800" />
                                  </div>
                                  <div className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                                    {React.createElement(
                                      iconMapping[
                                        questionTypeIcon(q.question_type)
                                      ],
                                      { size: 12 },
                                    )}
                                    <p>{index + 1}.</p>{" "}
                                    <p>{formatQuestionType(q.question_type)}</p>
                                  </div>
                                  <Select
                                    onValueChange={(value) =>
                                      updateSingle({
                                        questionId: q.quiz_question_id,
                                        points: value,
                                      })
                                    }
                                    defaultValue={q.points?.toString()}
                                  >
                                    <SelectTrigger className="h-fit w-fit px-2 py-1 text-xs">
                                      <SelectValue placeholder="Points" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Points</SelectLabel>
                                        {[1, 2, 3, 5, 10].map((value) => (
                                          <SelectItem
                                            key={value}
                                            value={value.toString()}
                                          >
                                            {value} point{value !== 1 && "s"}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    onValueChange={(value) =>
                                      updateSingle({
                                        questionId: q.quiz_question_id,
                                        time: value,
                                      })
                                    }
                                    defaultValue={q.time?.toString()}
                                  >
                                    <SelectTrigger className="h-fit w-fit px-2 py-1 text-xs">
                                      <SelectValue placeholder="Time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Time</SelectLabel>
                                        {[10, 15, 20, 30, 60].map((value) => (
                                          <SelectItem
                                            key={value}
                                            value={value.toString()}
                                          >
                                            {value} second{value !== 1 && "s"}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="mt-3 flex gap-2 md:mt-0">
                                  <Copy
                                    className="size-6 cursor-pointer rounded-md border border-zinc-200 py-1 dark:border-zinc-800"
                                    onClick={() =>
                                      console.log(
                                        `Copying question with id: ${q.quiz_question_id}`,
                                      )
                                    }
                                  />
                                  <button
                                    className="flex h-fit w-fit items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 dark:border-zinc-800"
                                    onClick={() =>
                                      navigate(
                                        `/professor/quiz/${quizId}/question/${q.quiz_question_id}/edit`,
                                      )
                                    }
                                  >
                                    <Pen size={12} />
                                    Edit
                                  </button>
                                  <Trash
                                    className="size-6 cursor-pointer rounded-md bg-red-600 p-1"
                                    onClick={() =>
                                      console.log(
                                        `Deleting question with id: ${q.quiz_question_id}`,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <h1>{q.question}</h1>
                              <p className="text-xs opacity-60">
                                Answer {q.question_type === "mcq" && "choices"}
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {(q.distractor ?? [q.right_answer]).map(
                                  (a, index) => (
                                    <div
                                      key={index}
                                      className={`flex items-center rounded-lg p-2 text-xs shadow ${
                                        a.toLowerCase() ===
                                        q.right_answer.toLowerCase()
                                          ? "bg-green-500 text-white"
                                          : "bg-zinc-200 dark:bg-zinc-800"
                                      }`}
                                    >
                                      {a.toLowerCase() ===
                                      q.right_answer.toLowerCase() ? (
                                        <Check className="mr-2" size={16} />
                                      ) : (
                                        <X
                                          className="mr-2 text-red-600"
                                          size={16}
                                        />
                                      )}
                                      <p>
                                        {a.charAt(0).toUpperCase() + a.slice(1)}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <p>No Questions Available</p>
          )}
        </div>
        <Button
          onClick={() => console.log("Adding a new question")}
          className="mt-4 self-center justify-self-center"
          size="sm"
        >
          Add More Questions
        </Button>
      </div>
    </div>
  );
}
